"use client";
import { ChevronDown, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api-client";
import type { BudgetSummary, EnvelopeSummary } from "./balance-hero";
import { ConfirmDialog } from "./confirm-dialog";
import { Dialog } from "./dialog";
import { ExpenseDialog } from "./expense-dialog";

export function EnvelopeDetailActions({envelope,budget}:{envelope:EnvelopeSummary;budget:BudgetSummary}){
  const[edit,setEdit]=useState(false); const[move,setMove]=useState(false); const[confirmDelete,setConfirmDelete]=useState(false); const[pending,setPending]=useState(false); const router=useRouter();
  async function save(e:React.FormEvent<HTMLFormElement>){e.preventDefault();setPending(true);const data=new FormData(e.currentTarget);try{await apiRequest(`/api/v1/envelopes/${envelope.id}`,{method:"PATCH",body:JSON.stringify({name:data.get("name"),allocatedAmount:data.get("allocatedAmount")})});toast.success("Envelope updated");setEdit(false);router.refresh()}catch(error){toast.error(error instanceof Error?error.message:"Could not update envelope")}finally{setPending(false)}}
  function requestDelete(){if(envelope.transactionCount){setMove(true);return}setConfirmDelete(true)}
  async function remove(){setPending(true);try{await apiRequest(`/api/v1/envelopes/${envelope.id}`,{method:"DELETE"});toast.success("Envelope deleted");router.push("/envelopes");router.refresh()}catch(error){toast.error(error instanceof Error?error.message:"Could not delete envelope")}finally{setPending(false)}}
  async function moveAndDelete(e:React.FormEvent<HTMLFormElement>){e.preventDefault();setPending(true);const target=new FormData(e.currentTarget).get("moveTo");try{await apiRequest(`/api/v1/envelopes/${envelope.id}?moveTo=${target}`,{method:"DELETE"});toast.success("History moved and envelope deleted");router.push("/envelopes");router.refresh()}catch(error){toast.error(error instanceof Error?error.message:"Could not move transactions")}finally{setPending(false)}}
  const moveTargets=budget.envelopes.filter(item=>item.id!==envelope.id&&item.type===envelope.type);
  return <div className="detail-actions"><ExpenseDialog budget={budget} defaultEnvelopeId={envelope.id} kind={envelope.type==="savings"?"saving":"expense"} trigger={<button className="primary-button">Add {envelope.type==="savings"?"saving":"expense"}</button>}/><button className="secondary-button" onClick={()=>setEdit(true)}><Pencil/>Edit</button><button className="icon-button danger-button" onClick={requestDelete} aria-label="Delete envelope"><Trash2/></button>
    <Dialog open={edit} onClose={()=>setEdit(false)} title="Edit envelope" eyebrow="Allocation"><form className="form-grid" onSubmit={save}><label><span>Name</span><input name="name" defaultValue={envelope.name} required maxLength={60}/></label><label><span>Monthly allocation</span><div className="money-input"><b>₹</b><input name="allocatedAmount" defaultValue={envelope.allocatedAmount} inputMode="decimal" pattern="\d+(\.\d{1,2})?" required/></div></label><button className="primary-button" disabled={pending}>{pending?"Saving…":"Save changes"}</button></form></Dialog>
    <Dialog open={move} onClose={()=>setMove(false)} title="Preserve transaction history" eyebrow="Safe deletion"><form className="form-grid" onSubmit={moveAndDelete}><p className="dialog-copy">{envelope.name} contains {envelope.transactionCount} entries. Move them to another {envelope.type} envelope before deleting it.</p>{moveTargets.length?<><label><span>Move transactions to</span><div className="select-control field-select"><select name="moveTo" required defaultValue=""><option value="" disabled>Choose an envelope</option>{moveTargets.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select><ChevronDown/></div></label><button className="destructive-button" disabled={pending}>{pending?"Moving…":"Move history and delete"}</button></>:<div className="form-error">Create another {envelope.type} envelope before deleting this one, so its history stays intact.</div>}</form></Dialog>
    <ConfirmDialog open={confirmDelete} onClose={()=>setConfirmDelete(false)} onConfirm={remove} pending={pending} title={`Delete ${envelope.name}?`} description="This empty envelope will be permanently removed from the current month." confirmLabel="Delete envelope"/>
  </div>;
}
