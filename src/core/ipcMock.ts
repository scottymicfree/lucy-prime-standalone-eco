/**
 * Mocks the Electron IPC Renderer channel behaviour so the web sandbox gracefully interacts
 * exactly as if it was executing IPC commands inside the Electron Host container.
 */

class IPCMock {
  private listeners: Map<string, Function[]> = new Map();
  private ws: WebSocket | null = null;
  
  constructor() {
     // Wait for DOM
     setTimeout(() => {
        try {
          this.ws = new WebSocket("ws://localhost:3000");
          this.ws.onmessage = (event) => {
             try {
               const data = JSON.parse(event.data);
               if (data.channel) {
                  window.dispatchEvent(new CustomEvent(data.channel, { detail: data.payload }));
               }
             } catch {}
          };
        } catch(e) {}
     }, 1000);
  }

  on(channel: string, listener: (event: any, ...args: any[]) => void) {
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, []);
    }
    
    // Bind native windows handler to map arguments successfully
    const nativeHandler = (e: any) => listener({}, e.detail);
    this.listeners.get(channel)!.push({ original: listener, native: nativeHandler } as any);
    
    window.addEventListener(channel, nativeHandler);
  }

  removeListener(channel: string, listener: (event: any, ...args: any[]) => void) {
    const list = this.listeners.get(channel);
    if (!list) return;

    const idx = list.findIndex((l: any) => l.original === listener);
    if (idx > -1) {
      window.removeEventListener(channel, (list[idx] as any).native);
      list.splice(idx, 1);
    }
  }

  send(channel: string, payload: any) {
    console.log(`[IPC SEND] -> Backend: ${channel}`, payload);
    
    fetch("/api/kernel/event", {
       method: "POST", 
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ channel, payload })
    }).catch(() => {
       // Gracefully swallow 404/500 if backend is down during sandbox reload
    });
    
    // Fallbacks for simulated events that don't need real Node execution right now
    if (channel === "USER.SELECT.MODULE") {
      setTimeout(() => {
        const proposal = { 
           type: "DASHBOARD_FLIP", 
           module: payload.module,
           confidence: 0.94,
           auditHash: Math.random().toString(16).slice(2)
        };
        
        console.log(`[IPC RECEIVE] <- Frontend: SYSTEM.DASHBOARD.FLIP`, proposal);
        
        window.dispatchEvent(new CustomEvent("SYSTEM.SPATIALFACE.SURFACED", {
           detail: { title: "E.M.M.A. Dashboard Flip", message: `Governed navigation to ${payload.module} approved.`, style: "lucy" }
        }));
        
        window.dispatchEvent(new CustomEvent("SYSTEM.DASHBOARD.FLIP", { detail: proposal }));
      }, 200);
    }
  }
}

export const ipcRenderer = new IPCMock();

export function emitEvent(eventName: string, payload: any) {
  ipcRenderer.send(eventName, payload);
}
