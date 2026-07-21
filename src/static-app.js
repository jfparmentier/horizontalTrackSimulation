import { DEFAULT_PARAMETERS } from "./constants.js";
import { mountStaticApparatus } from "./apparatus-view.js";

const host = document.querySelector("#apparatus-host");

if (!host) {
  throw new Error("Le conteneur #apparatus-host est introuvable.");
}

mountStaticApparatus(host, {
  ...DEFAULT_PARAMETERS,
  sensorCount: 8,
});
