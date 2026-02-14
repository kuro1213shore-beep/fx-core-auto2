export function chooseDirection(){

  return new Promise(resolve => {

    const modal = document.createElement("div");
    modal.style.position="fixed";
    modal.style.inset="0";
    modal.style.background="rgba(0,0,0,.4)";
    modal.style.display="flex";
    modal.style.alignItems="center";
    modal.style.justifyContent="center";

    modal.innerHTML = `
      <div style="background:#1b2235;padding:20px;border-radius:14px">
        <button id="longBtn">LONG</button>
        <button id="shortBtn">SHORT</button>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector("#longBtn").onclick=()=>{
      modal.remove();
      resolve("LONG");
    };

    modal.querySelector("#shortBtn").onclick=()=>{
      modal.remove();
      resolve("SHORT");
    };

  });
}