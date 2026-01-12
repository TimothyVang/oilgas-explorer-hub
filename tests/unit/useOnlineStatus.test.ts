import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

describe("useOnlineStatus", () => {
  // Store original navigator.onLine
  const originalOnLine = navigator.onLine;

  // Mock navigator.onLine
  const setNavigatorOnLine = (value: boolean) => {
    Object.defineProperty(navigator, "onLine", {
      value,
      configurable: true,
      writable: true,
    });
  };

  beforeEach(() => {
    // Reset to online state
    setNavigatorOnLine(true);
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Restore original value
    Object.defineProperty(navigator, "onLine", {
      value: originalOnLine,
      configurable: true,
      writable: true,
    });
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe("Initial State", () => {
    it("should start online when navigator.onLine is true", () => {
      setNavigatorOnLine(true);
      const { result } = renderHook(() => useOnlineStatus());

      expect(result.current.isOnline).toBe(true);
      expect(result.current.isOffline).toBe(false);
    });

    it("should start offline when navigator.onLine is false", () => {
      setNavigatorOnLine(false);
      const { result } = renderHook(() => useOnlineStatus());

      expect(result.current.isOnline).toBe(false);
      expect(result.current.isOffline).toBe(true);
    });

    it("should set lastOnlineAt when starting online", () => {
      setNavigatorOnLine(true);
      const { result } = renderHook(() => useOnlineStatus());

      expect(result.current.lastOnlineAt).toBeInstanceOf(Date);
    });

    it("should not set lastOnlineAt when starting offline", () => {
      setNavigatorOnLine(false);
      const { result } = renderHook(() => useOnlineStatus());

      expect(result.current.lastOnlineAt).toBeNull();
    });
  });

  describe("Event Listeners", () => {
    it("should update to online when online event fires", async () => {
      setNavigatorOnLine(false);
      const { result } = renderHook(() => useOnlineStatus());

      expect(result.current.isOnline).toBe(false);

      // Simulate going online
      act(() => {
        setNavigatorOnLine(true);
        window.dispatchEvent(new Event("online"));
      });

      expect(result.current.isOnline).toBe(true);
      expect(result.current.isOffline).toBe(false);
    });

    it("should update to offline when offline event fires", async () => {
      setNavigatorOnLine(true);
      const { result } = renderHook(() => useOnlineStatus());

      expect(result.current.isOnline).toBe(true);

      // Simulate going offline
      act(() => {
        setNavigatorOnLine(false);
        window.dispatchEvent(new Event("offline"));
      });

      expect(result.current.isOnline).toBe(false);
      expect(result.current.isOffline).toBe(true);
    });
  });

  describe("Callbacks", () => {
    it("should call onOnline callback when going online", () => {
      setNavigatorOnLine(false);
      const onOnline = vi.fn();

      renderHook(() => useOnlineStatus({ onOnline }));

      act(() => {
        setNavigatorOnLine(true);
        window.dispatchEvent(new Event("online"));
      });

      expect(onOnline).toHaveBeenCalledTimes(1);
    });

    it("should call onOffline callback when going offline", () => {
      setNavigatorOnLine(true);
      const onOffline = vi.fn();

      renderHook(() => useOnlineStatus({ onOffline }));

      act(() => {
        setNavigatorOnLine(false);
        window.dispatchEvent(new Event("offline"));
      });

      expect(onOffline).toHaveBeenCalledTimes(1);
    });

    it("should not call onOnline when starting online", () => {
      setNavigatorOnLine(true);
      const onOnline = vi.fn();

      renderHook(() => useOnlineStatus({ onOnline }));

      expect(onOnline).not.toHaveBeenCalled();
    });
  });

  describe("checkConnection", () => {
    it("should return current online status", async () => {
      setNavigatorOnLine(true);
      const { result } = renderHook(() => useOnlineStatus());

      // Mock fetch to succeed
      globalThis.fetch = vi.fn().mockResolvedValue({ ok: true });

      let connectionResult: boolean | undefined;
      await act(async () => {
        connectionResult = await result.current.checkConnection();
      });

      expect(connectionResult).toBe(true);
    });

    it("should update lastOnlineAt on successful check", async () => {
      setNavigatorOnLine(true);
      const { result } = renderHook(() => useOnlineStatus());

      const initialTime = result.current.lastOnlineAt;

      // Mock fetch to succeed
      globalThis.fetch = vi.fn().mockResolvedValue({ ok: true });

      // Wait a bit
      vi.advanceTimersByTime(100);

      await act(async () => {
        await result.current.checkConnection();
      });

      // lastOnlineAt should be updated
      expect(result.current.lastOnlineAt).toBeInstanceOf(Date);
      expect(result.current.lastOnlineAt!.getTime()).toBeGreaterThanOrEqual(
        initialTime!.getTime()
      );
    });
  });

  describe("Cleanup", () => {
    it("should remove event listeners on unmount", () => {
      const addSpy = vi.spyOn(window, "addEventListener");
      const removeSpy = vi.spyOn(window, "removeEventListener");

      const { unmount } = renderHook(() => useOnlineStatus());

      expect(addSpy).toHaveBeenCalledWith("online", expect.any(Function));
      expect(addSpy).toHaveBeenCalledWith("offline", expect.any(Function));

      unmount();

      expect(removeSpy).toHaveBeenCalledWith("online", expect.any(Function));
      expect(removeSpy).toHaveBeenCalledWith("offline", expect.any(Function));

      addSpy.mockRestore();
      removeSpy.mockRestore();
    });
  });
});
