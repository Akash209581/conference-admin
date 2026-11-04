"use client";
import {useLayoutEffect,useRef,useState,type ReactNode} from 'react';
import {createPortal} from 'react-dom';
import {referenceStyle} from './style-source';
/** Preserve the supplied cascade independently of the retained app's Tailwind reset. */
export default function ReferenceHost({children}:{children:ReactNode}){
 const host=useRef<HTMLDivElement>(null);const [root,setRoot]=useState<ShadowRoot|null>(null);
 useLayoutEffect(()=>{setRoot(host.current!.shadowRoot||host.current!.attachShadow({mode:'open'}))},[]);
 return <div ref={host} style={{display:'block',width:'100%',minHeight:'100vh'}}>{root&&createPortal(<><style>{':host{all:initial;display:block;width:100%}'+referenceStyle}</style>{children}</>,root)}</div>;
}
