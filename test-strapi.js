const fetch = require("node-fetch");

const STRAPI_API_URL = "http://localhost:1337/api";
const STRAPI_TOKEN = "e912c4b11258269dae3bf517aed434c60287679fb2a6467f95288f372f59da1f28fa4b1f7795392c827705cadcad7ea9956ac9faeb4e6ea18486d159f4b7b2ef3bcf97e85c8d3536e2b4a726d70e1e855e2f45b16066b30062c59d29dc7a28baefec7e1c91d1b51a8226436aa295a277be879294c8cfd993ff083d8a47b3bbda";

async function testStrapi() {
  try {
    const res = await fetch(`${STRAPI_API_URL}/categories`, {
      headers: {
        Authorization: `Bearer ${STRAPI_TOKEN}`,
      },
    });

    if (!res.ok) {
      console.error(`❌ Erreur ${res.status}: ${res.statusText}`);
      console.log(await res.text());
      return;
    }

    const data = await res.json();
    console.log("✅ Réponse Strapi:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("❌ Erreur de connexion:", error);
  }

  try {
    const res = await fetch(`${STRAPI_API_URL}/produits`, {
      headers: {
        Authorization: `Bearer ${STRAPI_TOKEN}`,
      },
    });

    if (!res.ok) {
      console.error(`❌ Erreur ${res.status}: ${res.statusText}`);
      console.log(await res.text());
      return;
    }

    const data = await res.json();
    console.log("✅ Réponse Strapi:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("❌ Erreur de connexion:", error);
  }
}

testStrapi();
