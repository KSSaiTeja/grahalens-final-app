import { isOnlineFromState } from "@/lib/network/online";
import type { NetworkState } from "expo-network";

function state(partial: Partial<NetworkState>): NetworkState {
  return {
    type: "WIFI",
    isConnected: true,
    isInternetReachable: true,
    ...partial,
  } as NetworkState;
}

describe("isOnlineFromState", () => {
  it("is offline when disconnected", () => {
    expect(isOnlineFromState(state({ isConnected: false }))).toBe(false);
  });

  it("stays online when reachability is false but connected", () => {
    expect(
      isOnlineFromState(
        state({ isConnected: true, isInternetReachable: false }),
      ),
    ).toBe(true);
  });

  it("treats unknown reachability as online", () => {
    expect(
      isOnlineFromState(
        state({ isConnected: true, isInternetReachable: undefined }),
      ),
    ).toBe(true);
  });

  it("is online when connected and reachable", () => {
    expect(isOnlineFromState(state({}))).toBe(true);
  });
});
