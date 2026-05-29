import React from "react";

export type DashboardFace = "mesh" | "earth" | "ue5" | "unity" | "fivem" | "files";

interface CubeNavigatorProps {
  currentFace: DashboardFace;
  dashboards: Record<DashboardFace, React.ReactNode>;
  faceOrder: DashboardFace[];
}

export default function CubeNavigator({
  currentFace,
  dashboards,
  faceOrder,
}: CubeNavigatorProps) {
  const currentIndex = faceOrder.indexOf(currentFace);
  
  // Using a hexagonal carousel approach for standard HD screens
  // 6 faces = 60 degrees apart over Y axis.
  const anglePerFace = 60;
  
  const getFaceTransform = (faceIndex: number) => {
    const angle = faceIndex * anglePerFace;
    // TranslateZ radius calculation based on CSS variables or fixed width.
    // For 6 faces, R = width / (2 * Math.tan(Math.PI / 6)). 
    // If our face width is around 1200px, R is ~1040px.
    return `rotateY(${angle}deg) translateZ(1050px)`;
  };

  const getContainerTransform = () => {
    // We rotate the container in the *opposite* direction to bring the current face to front.
    const rotation = -currentIndex * anglePerFace;
    // We also scale down slightly and translate Z backward to keep the active face inside the viewport.
    return `translateZ(-1050px) rotateY(${rotation}deg)`;
  };

  return (
    <div
      className="w-full h-full flex items-center justify-center overflow-hidden bg-slate-900/50"
      style={{ perspective: "2500px" }}
    >
      <div
        className="relative shadow-2xl"
        style={{
          width: "1200px",  // Face width
          height: "90%", // Face height relative to screen
          transformStyle: "preserve-3d",
          transform: getContainerTransform(),
          transition: "transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        }}
      >
        {faceOrder.map((face, index) => (
          <div
            key={face}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              transformStyle: "preserve-3d",
              transform: getFaceTransform(index),
              opacity: face === currentFace ? 1 : 0.05, // dim inactive faces heavily
              transition: "opacity 0.6s ease-in-out",
              pointerEvents: face === currentFace ? "auto" : "none" // disable clicks on hidden faces
            }}
            className={`rounded-xl overflow-hidden border border-slate-700/50 shadow-[0_0_50px_rgba(0,0,0,0.8)] bg-slate-950 ${face === currentFace ? "" : "blur-sm"}`}
          >
            {dashboards[face]}
          </div>
        ))}
      </div>
    </div>
  );
}
