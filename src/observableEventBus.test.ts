import { assertEquals } from "@std/assert";
import { assertSpyCalls, spy } from "@std/testing/mock";
import { ObservableEventBus } from "./observableEventBus.ts";

import { take } from "rxjs/operators";
import { Event, EventBus } from "@collidor/event";

// --- Test Events ---
class UserCreated extends Event<string> {}
class OrderPlaced extends Event<{ id: number; total: number }> {}

Deno.test("ObservableEventBus", async (t) => {
  await t.step("should receive events as an observable stream", () => {
    const bus = new ObservableEventBus();
    const result: string[] = [];

    // Subscribe
    const sub = bus.on(UserCreated).subscribe((data) => {
      result.push(data);
    });

    // Emit
    bus.emit(new UserCreated("alice"));
    bus.emit(new UserCreated("bob"));

    assertEquals(result, ["alice", "bob"]);
    sub.unsubscribe();
  });

  await t.step(
    "should correctly unregister from underlying bus on unsubscribe",
    () => {
      const internalBus = new EventBus();
      const bus = new ObservableEventBus(internalBus);

      // Spy on the internal 'off' method to ensure cleanup happens
      const offSpy = spy(internalBus, "off");

      const sub = bus.on(UserCreated).subscribe(() => {});

      // Emit to prove it's working (optional)
      bus.emit(new UserCreated("test"));

      // Unsubscribe via RxJS
      sub.unsubscribe();

      // Assert internal bus cleanup was triggered
      assertSpyCalls(offSpy, 1);
    },
  );

  await t.step("should handle listening to multiple event types", () => {
    const bus = new ObservableEventBus();
    const result: any[] = [];

    bus.on([UserCreated, OrderPlaced]).subscribe((data) => {
      result.push(data);
    });

    bus.emit(new UserCreated("charlie"));
    bus.emit(new OrderPlaced({ id: 1, total: 100 }));

    assertEquals(result, ["charlie", { id: 1, total: 100 }]);
  });

  await t.step("should support RxJS operators", async () => {
    const bus = new ObservableEventBus();
    const result: string[] = [];

    // Example: Take only the first 2 events
    await new Promise<void>((resolve) => {
      bus.on(UserCreated).pipe(take(2)).subscribe({
        next: (data) => result.push(data),
        complete: resolve,
      });

      bus.emit(new UserCreated("1"));
      bus.emit(new UserCreated("2"));
      bus.emit(new UserCreated("3")); // Should be ignored
    });

    assertEquals(result, ["1", "2"]);
  });

  await t.step(
    "should dynamically propagate subscriptions and availability across PortChannel",
    async () => {
      const { PortChannel } = await import("@collidor/event");

      type FakePort = {
        messages: any[];
        sentMessages: any[];
        receivedMessages: any[];
        postMessage: (msg: any) => void;
        onmessage: ((ev: any) => void) | null;
        onmessageerror: ((ev: any) => void) | null;
      };

      const port1: FakePort = {
        messages: [],
        sentMessages: [],
        receivedMessages: [],
        postMessage: () => {},
        onmessage: null,
        onmessageerror: null,
      };
      const port2: FakePort = {
        messages: [],
        sentMessages: [],
        receivedMessages: [],
        postMessage: () => {},
        onmessage: null,
        onmessageerror: null,
      };

      port1.postMessage = function (msg: any) {
        port2.onmessage?.({ data: msg, currentTarget: port2 } as any);
      };
      port2.postMessage = function (msg: any) {
        port1.onmessage?.({ data: msg, currentTarget: port1 } as any);
      };

      const channel1 = new PortChannel();
      const channel2 = new PortChannel();

      channel1.addPort(port1);
      channel2.addPort(port2);

      const bus1 = new ObservableEventBus({ channel: channel1 });
      const bus2 = new ObservableEventBus({ channel: channel2 });

      // Before subscribing, channel1 has no subscribers for UserCreated
      assertEquals(channel1.isAvailable("UserCreated"), false);

      const received: string[] = [];
      // Node 2 subscribes via RxJS Observable
      const sub = bus2.on(UserCreated).subscribe((data) => {
        received.push(data);
      });

      // Channel 1 should now immediately be aware of UserCreated subscription
      assertEquals(channel1.isAvailable("UserCreated"), true);

      // Node 1 emits an event over the channel
      bus1.emit(new UserCreated("diana"));

      assertEquals(received, ["diana"]);

      // Node 2 unsubscribes via RxJS
      sub.unsubscribe();

      // Channel 1 should now reflect that UserCreated is no longer available
      assertEquals(channel1.isAvailable("UserCreated"), false);
    },
  );

  await t.step(
    "should synchronize pre-existing listeners via bidirectional handshake on connect",
    async () => {
      const { PortChannel } = await import("@collidor/event");

      type FakePort = {
        postMessage: (msg: any) => void;
        onmessage: ((ev: any) => void) | null;
        onmessageerror: ((ev: any) => void) | null;
      };

      const port1: FakePort = {
        postMessage: () => {},
        onmessage: null,
        onmessageerror: null,
      };
      const port2: FakePort = {
        postMessage: () => {},
        onmessage: null,
        onmessageerror: null,
      };

      port1.postMessage = function (msg: any) {
        port2.onmessage?.({ data: msg, currentTarget: port2 } as any);
      };
      port2.postMessage = function (msg: any) {
        port1.onmessage?.({ data: msg, currentTarget: port1 } as any);
      };

      const channel1 = new PortChannel();
      const channel2 = new PortChannel();

      const bus1 = new ObservableEventBus({ channel: channel1 });
      const bus2 = new ObservableEventBus({ channel: channel2 });

      // Node 2 subscribes BEFORE ports are connected
      const sub = bus2.on(OrderPlaced).subscribe(() => {});

      // Connect ports
      channel1.addPort(port1);
      channel2.addPort(port2);

      // Bidirectional handshake (startEvent <-> startAckEvent) should sync OrderPlaced to channel1
      assertEquals(channel1.isAvailable("OrderPlaced"), true);

      sub.unsubscribe();
      assertEquals(channel1.isAvailable("OrderPlaced"), false);
    },
  );
});
