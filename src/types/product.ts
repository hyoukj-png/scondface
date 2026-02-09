export interface Product {
    id: string;
    name: string;
    price: string;
    image: string;
    images?: string[]; // 추가 이미지 배열
    description?: string;
    category?: string;
    stock?: number;
    is_featured?: boolean; // 메인 페이지 노출 여부
    is_bestseller?: boolean; // Best Seller 여부
}
