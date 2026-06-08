import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getAuth } from "@clerk/nextjs/server"

const createErrorResponse = (message: string, status: number) => {
    return NextResponse.json({message}, {status})
}

export async function GET(request: NextRequest){
    // Use getAuth instead of auth to avoid consuming request body
    const { userId } = getAuth(request)
    if (!userId) {
        return createErrorResponse("Unauthorized", 401)
    }
    
    let prisma: PrismaClient | null = null
    
    try {
        prisma = new PrismaClient()
        await prisma.$connect()
        
        const videos = await prisma.video.findMany({
            where: {userId},
            orderBy: {createdAt: "desc"}
        })
        return NextResponse.json(videos)
    } catch (error) {
        console.error("Error fetching videos", error)
        return createErrorResponse("Error fetching videos", 500)
    } finally {
        if (prisma) {
            await prisma.$disconnect()
        }
    }
}
