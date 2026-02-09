export interface Category {
    id: string;
    value: string;       // 카테고리 값 (예: "sunglasses")
    label: string;       // 이름 (예: "선글라스")
    label_en?: string;   // 영문 이름 (선택 사항)
    sort_order: number;  // 정렬 순서
    is_active?: boolean; // 활성화 여부
    created_at?: string;
    updated_at?: string;
}
