import React from "react";
import GatewayList from "../components/GatewayList";

export default function GatewayDiff() {
  return (
    <GatewayList
      variant="DIFF"           // <- ici, on passe le nom de la variante JSON
      title="GATEWAYS DIFFUSION"
    />
  );
}
