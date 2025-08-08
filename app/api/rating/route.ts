import {getCurrentUser} from "@/actions/get-current-user";
import { PrismaClient, Review } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

export async function POST(request: Request){
    const currentUser = await getCurrentUser();

    if(!currentUser){
        return NextResponse.error();
    }

    const body = await request.json()
    const {comment, rating, product, userId} = body;

    const deliveredOrder = currentUser?.Order?.some(order =>
        order.products.find(item => item.id === product.id) && order.deliveryStatus === 'delivered'
      );

    const userReview = product?.reviews.find(((review: Review) =>{
        return review.userId === currentUser.id
    }))

    if(userReview || !deliveredOrder){
        return NextResponse.error()
    }

    const review = await prisma?.review.create({
        data: {
            comment,
            rating,
            productId: product.id,
            userId
        }
    })

    return NextResponse.json(review)
}