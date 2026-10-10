// Isolated for meaningful unavailable/exception tests without changing browser settings.
export function webglAvailable(createCanvas:()=>Pick<HTMLCanvasElement,"getContext">):boolean {
  try {
    const context=createCanvas().getContext("webgl2") as WebGL2RenderingContext|null;
    context?.getExtension("WEBGL_lose_context")?.loseContext();
    return !!context;
  } catch {return false;}
}
