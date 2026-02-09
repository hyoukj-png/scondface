import { NextRequest, NextResponse } from 'next/server';

// 스마트택배 API를 사용한 배송 조회
export async function POST(request: NextRequest) {
    try {
        const { trackingNumber, carrierCode } = await request.json();

        if (!trackingNumber || !carrierCode) {
            return NextResponse.json(
                { error: '송장번호와 택배사 코드가 필요합니다.' },
                { status: 400 }
            );
        }

        const apiKey = process.env.SWEET_TRACKER_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: 'API Key가 설정되지 않았습니다.' },
                { status: 500 }
            );
        }

        // 스마트택배 API 호출
        const response = await fetch(
            `https://info.sweettracker.co.kr/api/v1/trackingInfo?t_key=${apiKey}&t_code=${carrierCode}&t_invoice=${trackingNumber}`
        );

        if (!response.ok) {
            throw new Error('택배 조회 API 호출 실패');
        }

        const data = await response.json();

        // API 응답이 성공인지 확인
        if (data.status === false) {
            return NextResponse.json(
                { error: data.msg || '배송 정보를 찾을 수 없습니다.' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                carrier: data.companyName,
                trackingNumber: data.invoiceNo,
                status: data.level, // 1: 배송준비중, 2: 집화완료, 3: 배송중, 4: 지점 도착, 5: 배송출발, 6: 배송완료
                statusText: data.levelName,
                receiver: data.receiverName,
                senderName: data.senderName,
                itemName: data.itemName,
                trackingDetails: data.trackingDetails || [],
                lastUpdateTime: data.lastDetailTime,
                completeYN: data.completeYN === 'Y' // 배송 완료 여부
            }
        });

    } catch (error: any) {
        console.error('Tracking API Error:', error);
        return NextResponse.json(
            { error: error.message || '배송 조회 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
