"use client";
import { RotateCcw } from "lucide-react";
export default function ErrorPage({reset}:{error:Error&{digest?:string};reset:()=>void}){return <main className="standalone-state"><h1>Something didn’t add up</h1><p>We couldn’t load this view. Your financial records have not been changed.</p><button className="primary-button" onClick={reset}><RotateCcw/>Try again</button></main>}
