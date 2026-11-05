import {backupAbstracts} from '@/lib/backup-abstracts';
import {resolveConference} from '@/lib/portal-settings';
import {adminGuard} from '@/lib/admin-guard';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

export async function POST(request: Request) {const denied=await adminGuard();if(denied)return denied;
  try {
    const { submissionId, status, slug } = await request.json();

    if (!submissionId || !status) {
      return NextResponse.json({ error: "Missing submissionId or status" }, { status: 400 });
    }

    if(!['DRAFT','SUBMITTED','UNDER_REVIEW','ACCEPTED','REJECTED','REVISION_REQUIRED'].includes(status))return NextResponse.json({error:'Invalid status'},{status:400});
    if(typeof slug!=='string')return NextResponse.json({error:'Conference is required'},{status:400});
    const conference=await resolveConference(slug);
    if((await backupAbstracts(slug)).some(b=>b.id===submissionId)){
      const key='record_workflow:backup:'+submissionId;
      const labels:Record<string,string>={DRAFT:'New',SUBMITTED:'New',UNDER_REVIEW:'Under review',ACCEPTED:'Accepted',REJECTED:'Rejected',REVISION_REQUIRED:'Under review'};
      await prisma.$transaction(async tx=>{const existing=await tx.systemSetting.findUnique({where:{conferenceId_key:{conferenceId:conference.id,key}}});const value={...((existing?.value as Record<string,any>)||{}),status:labels[status],submissionStatus:status};await tx.systemSetting.upsert({where:{conferenceId_key:{conferenceId:conference.id,key}},create:{conferenceId:conference.id,key,value},update:{value}});await tx.auditLog.create({data:{action:'portal.record.updated',entity:'backup',entityId:submissionId,metadata:{conferenceId:conference.id,status}}})});
      return NextResponse.json({success:true});
    }
    const publicSubmission=await prisma.publicAbstractSubmission.findFirst({where:{id:submissionId,conferenceId:conference.id},select:{id:true}});
    if(publicSubmission){await prisma.$transaction(async tx=>{await tx.publicAbstractSubmission.update({where:{id:submissionId},data:{status}});await tx.auditLog.create({data:{action:'portal.record.updated',entity:'PublicAbstractSubmission',entityId:submissionId,metadata:{status,conferenceId:conference.id}}})});return NextResponse.json({success:true})}
    const updated = await prisma.abstractSubmission.update({
      where: { id: submissionId, conferenceId: conference.id, deletedAt: null },
      data: { status: status as any }
    });

    return NextResponse.json({ success: true, submission: updated });
  } catch (error: any) {
    console.error("Submission status update error:", error);
    return NextResponse.json({ error: error.message || "Failed to update submission status" }, { status: 500 });
  }
}
