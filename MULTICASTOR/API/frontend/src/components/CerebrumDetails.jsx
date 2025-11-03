import React from "react";
import { useParams } from "react-router-dom";
import envConfig from "../pages/envConfig";

export default function CerebrumDetails() {
  const { env } = useParams();

  const config = envConfig[env];

  if (!config) {
    return <p>Environnement inconnu : {env}</p>;
  }

  return (
    <div>
      <h1>Cerebrum Details</h1>
      <p>Interface pour {config.label}</p>
    </div>
  );
}

