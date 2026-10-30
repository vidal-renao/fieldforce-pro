'use client';
import type {FormEvent,ReactNode} from 'react';
export function GuardedStatusForm({children,action,message,className}:{children:ReactNode;action:(data:FormData)=>void|Promise<void>;message:string;className?:string}){
 function confirmCompletion(event:FormEvent<HTMLFormElement>){
  const data=new FormData(event.currentTarget);
  if(data.get('status')==='completed'&&!window.confirm(message))event.preventDefault();
 }
 return <form action={action} onSubmit={confirmCompletion} className={className}>{children}</form>;
}
