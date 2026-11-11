"use strict";

/**
 * Maps lesson model markers to their existing initializer functions.
 * Keep this adapter independent of the curriculum and document structure:
 * bindAvailable() only initializes models present in the current view.
 */
(() => {
  const definitions = Object.freeze([
    Object.freeze(["[data-queue-lab]", "bindQueueLab"]),
    Object.freeze(["[data-encapsulation-lab]", "bindEncapsulationLab"]),
    Object.freeze(["[data-latency-lab]", "bindLatencyLab"]),
    Object.freeze(["[data-retry-lab]", "bindRetryLab"]),
    Object.freeze(["[data-dns-mail-lab]", "bindMailDeliveryLab"]),
    Object.freeze(["[data-delivery-architecture]", "bindDeliveryArchitecture"]),
    Object.freeze(["[data-delivery-lab]", "bindDeliveryLab"]),
    Object.freeze(["[data-socket-lab]", "bindSocketLab"]),
    Object.freeze(["[data-udp-lab]", "bindUdpLab"]),
    Object.freeze(["[data-tcp-lab]", "bindTcpLab"]),
    Object.freeze(["[data-tcp-prediction]", "bindTcpPrediction"]),
    Object.freeze(["[data-window-lab]", "bindWindowLab"]),
    Object.freeze(["[data-route-lab]", "bindRouteLab"]),
    Object.freeze(["[data-router-lab]", "bindRouterLab"]),
    Object.freeze(["[data-ip-lab]", "bindIpLab"]),
    Object.freeze(["[data-rule-lab]", "bindRuleLab"]),
    Object.freeze(["[data-media-lab]", "bindMedia"]),
    Object.freeze(["[data-stream-lab]", "bindStream"]),
    Object.freeze(["[data-voice-lab]", "bindVoice"]),
    Object.freeze(["[data-call-lab]", "bindCall"]),
    Object.freeze(["[data-qos-lab]", "bindQos"]),
    Object.freeze(["[data-threat-lab]", "bindThreat"]),
    Object.freeze(["[data-crypto-lab]", "bindCrypto"]),
    Object.freeze(["[data-sign-lab]", "bindSign"]),
    Object.freeze(["[data-tls-lab]", "bindTls"]),
    Object.freeze(["[data-defense-lab]", "bindDefense"]),
    Object.freeze(["[data-wireless-lab]", "bindWireless"]),
    Object.freeze(["[data-wifi-lab]", "bindWifi"]),
    Object.freeze(["[data-radio-choice-lab]", "bindRadioChooser"]),
    Object.freeze(["[data-handoff-lab]", "bindHandoff"]),
    Object.freeze(["[data-frame-lab]", "bindFrame"]),
    Object.freeze(["[data-parity-lab]", "bindParity"]),
    Object.freeze(["[data-access-lab]", "bindAccess"]),
    Object.freeze(["[data-switch-lab]", "bindSwitch"]),
    Object.freeze(["[data-vlan-lab]", "bindVlan"]),
    Object.freeze(["[data-ls-lab]", "bindLinkState"]),
    Object.freeze(["[data-dv-lab]", "bindDistanceVector"]),
    Object.freeze(["[data-ospf-lab]", "bindOspf"]),
    Object.freeze(["[data-bgp-lab]", "bindBgp"]),
    Object.freeze(["[data-sdn-lab]", "bindSdn"]),
    Object.freeze(["[data-icmp-lab]", "bindDiagnostics"]),
  ]);

  function bindAvailable(root, implementations, { lessonId, pageIndex, modelPageIndex }) {
    if (!root || typeof root.querySelector !== "function") {
      throw new TypeError("A lesson root with querySelector() is required");
    }
    for (const [selector, name] of definitions) {
      const model = root.querySelector(selector);
      if (!model) continue;
      const initialize = implementations?.[name];
      if (typeof initialize !== "function") {
        throw new Error(`Missing networking model initializer: ${name}`);
      }
      initialize(model);
    }
    // The LAN packet trace uses the entire page rather than a model node.
    if (lessonId === "module-6-4" && pageIndex === modelPageIndex) {
      if (typeof implementations?.bindLanTrace !== "function") {
        throw new Error("Missing networking model initializer: bindLanTrace");
      }
      implementations.bindLanTrace(root);
    }
  }

  window.BIT_FOUNDRY_NETWORKING_LAB_REGISTRY = Object.freeze({
    definitions,
    bindAvailable,
  });
})();
