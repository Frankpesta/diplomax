"use client";
import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Group } from "three";
import { useReducedMotion } from "framer-motion";
function Network({ animate }: { animate: boolean }) {
  const globe = useRef<Group>(null);
  useFrame((_, delta) => { if (globe.current && animate) globe.current.rotation.y += Math.min(delta, .05) * .09; });
  return <group ref={globe} rotation={[.18, .3, -.22]}>
    <mesh><sphereGeometry args={[2, 64, 48]} /><meshStandardMaterial color="#1b5543" roughness={.72} metalness={.15} /></mesh>
    <mesh><sphereGeometry args={[2.013, 28, 18]} /><meshBasicMaterial color="#b6d9a5" wireframe transparent opacity={.12} /></mesh>
    {[0, 1, 2].map(i => <group key={i} rotation={[.5 + i * .68, i * .9, .35]}>
      <mesh><torusGeometry args={[2.22 + i * .1, .012, 6, 128]} /><meshBasicMaterial color={i === 1 ? "#f4e8c5" : "#c7f36b"} transparent opacity={.8} /></mesh>
      <mesh position={[2.22 + i * .1, 0, 0]}><sphereGeometry args={[.065, 12, 12]} /><meshBasicMaterial color="#e4ffa8" /></mesh>
      <group position={[0, 2.22 + i * .1, 0]} rotation={[.3, .4, .3]}><mesh><boxGeometry args={[.27, .27, .27]} /><meshStandardMaterial color="#d7f497" roughness={.5} /></mesh><mesh position={[0, 0, .138]}><boxGeometry args={[.055, .27, .008]} /><meshBasicMaterial color="#28503e" /></mesh></group>
    </group>)}
  </group>;
}
function Fallback() { return <div className="globe-fallback"><span /><span /><span /></div>; }
class SceneBoundary extends Component<{children: ReactNode}, {failed: boolean}> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <Fallback /> : this.props.children; }
}
export default function DeliveryGlobe() {
  const reduced = useReducedMotion();
  const host = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [supported, setSupported] = useState(false);
  useEffect(() => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2");
    const frame = requestAnimationFrame(() => setSupported(Boolean(context)));
    context?.getExtension("WEBGL_lose_context")?.loseContext();
    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { threshold: .1 });
    if (host.current) observer.observe(host.current);
    const visibility = () => setActive(!document.hidden && Boolean(host.current && host.current.getBoundingClientRect().bottom > 0));
    document.addEventListener("visibilitychange", visibility);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); document.removeEventListener("visibilitychange", visibility); };
  }, []);
  return <div ref={host} className="h-full w-full" aria-hidden="true">{supported ? <SceneBoundary><Canvas camera={{ position: [0, 0, 7.7], fov: 43 }} dpr={[1, 1.5]} frameloop={active && !reduced ? "always" : "demand"} gl={{ alpha: true, antialias: true }}><ambientLight intensity={1.8} /><directionalLight position={[-3, 4, 5]} intensity={3} color="#efffd7" /><directionalLight position={[3, -2, 1]} intensity={.8} color="#c7f36b" /><Network animate={active && !reduced} /></Canvas></SceneBoundary> : <Fallback />}</div>;
}

