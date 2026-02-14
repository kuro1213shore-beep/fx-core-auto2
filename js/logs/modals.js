export function chooseDirection(){

  return new Promise(resolve => {

    const modal = document.createElement("div");
    modal.style.position = "fixed";
    modal.style.inset = "0";
    modal.style.background = "rgba(0,0,0,0.4)";
    modal.style.display = "flex";
    modal.style.alignItems = "center";
    modal.style.justifyContent = "center";
    modal.style.zIndex = "9999";

    modal.innerHTML = `
      <div style="
        background:#1b2235;
        padding:24px;
        border-radius:18px;
        text-align:center;
        width:80%;
        max-width:320px;
        box-shadow:0 10px 30px rgba(0,0,0,.6);
      ">
        <div style="margin-bottom:18px;font-size:18px;">
          Direction
        </div>

        <div style="display:flex;gap:12px;">
          <button id="longBtn" style="
            flex:1;padding:14px;border-radius:12px;
            background:#00c896;color:white;border:none;">
            LONG
          </button>

          <button id="shortBtn" style="
            flex:1;padding:14px;border-radius:12px;
            background:#ff4d4d;color:white;border:none;">
            SHORT
          </button>
        </div>

        <button id="cancelBtn" style="
          margin-top:14px;
          padding:10px 20px;
          border-radius:10px;
          border:none;
          background:#555;
          color:white;">
          CANCEL
        </button>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector("#longBtn").onclick = () => {
      modal.remove();
      resolve("LONG");
    };

    modal.querySelector("#shortBtn").onclick = () => {
      modal.remove();
      resolve("SHORT");
    };

    modal.querySelector("#cancelBtn").onclick = () => {
      modal.remove();
      resolve(null);
    };

  });
}