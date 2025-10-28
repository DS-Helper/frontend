// 고객 문의 페이지
import styles from '@/styles/Customer.module.scss';
import classNames from 'classnames/bind';
import React, { useState, useEffect, ChangeEvent } from "react";
import { getInquiries, postInquiry } from '@/lib/apis/customer';
import { Inquiry, InquiryFormData } from '@/types/customer';
import Image from 'next/image';

const cn = classNames.bind(styles);

export default function Customer(){
    const [activeTab, setActiveTab] = useState<"history" | "register">('history');
    const [inquiryType, setInquiryType] = useState(""); //문의 타입
    const [content, setContent] = useState("");
    const [images, setImages] = useState<string[]>([]); // 미리보기 URL 배열
    const [imageFiles, setImageFiles] = useState<File[]>([]); // 실제 파일 객체 배열
    
    // API에서 가져온 문의 데이터
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // 문의 내역 불러오기
    const fetchInquiries = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getInquiries();
            if (response && response.data) {
                // 배열인지 확인하고 안전하게 설정
                const data = response.data;
                if (Array.isArray(data)) {
                    setInquiries(data);
                } else if (Array.isArray(data.inquiries)) {
                    setInquiries(data.inquiries);
                } else if (Array.isArray(data.items)) {
                    setInquiries(data.items);
                } else {
                    console.error('예상하지 못한 응답 구조:', data);
                    setInquiries([]);
                    setError('문의 내역 데이터 형식이 올바르지 않습니다.');
                }
            } else {
                setInquiries([]);
                setError('문의 내역을 불러오는데 실패했습니다.');
            }
        } catch (err) {
            setInquiries([]);
            setError('문의 내역을 불러오는 중 오류가 발생했습니다.');
            console.error('문의 내역 불러오기 오류:', err);
        } finally {
            setLoading(false);
        }
    };

    // 컴포넌트 마운트 시 문의 내역 불러오기
    useEffect(() => {
        if (activeTab === 'history') {
            fetchInquiries();
        }
    }, [activeTab]);

    // 답변 내용 모달
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    
    const openModal = (answer: string | null) => {
        if (!answer) return; // 답변 없는 경우 클릭 x
        setSelectedAnswer(answer);
        setModalOpen(true);
    };

    const closeModal = () => {
        setSelectedAnswer(null);
        setModalOpen(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        try {
            // FormData 생성
            const formData = new FormData();
            
            // dto 객체 생성 및 JSON 문자열로 변환
            const dto = {
                type: inquiryType === "help" ? "도움 요청" :
                      inquiryType === "uncomfortable" ? "서비스 이용 불편" :
                      inquiryType === "proposal" ? "서비스 개선 제안" :
                      inquiryType === "etc" ? "기타" : inquiryType,
                content: content
            };
            
            // dto를 JSON 문자열로 추가
            formData.append('dto', JSON.stringify(dto));
            
            // 이미지 파일 추가
            imageFiles.forEach((file) => {
                formData.append('images', file);
            });
            
            const response = await postInquiry(formData);
            console.log('문의 등록 응답:', response);
            
            // 응답이 있고 상태 코드가 200번대면 성공으로 간주
            if (response && (response.status === 200 || response.status === 201)) {
                alert('문의가 성공적으로 등록되었습니다.');
                // 폼 초기화
                setInquiryType('');
                setContent('');
                setImages([]);
                setImageFiles([]);
                // 문의 내역 탭으로 이동하고 데이터 새로고침
                setActiveTab('history');
                await fetchInquiries();
            } else {
                setError('문의 등록에 실패했습니다.');
            }
        } catch (err) {
            setError('문의 등록 중 오류가 발생했습니다.');
            console.error('문의 등록 오류:', err);
        } finally {
            setLoading(false);
        }
    };

    /*
     <더보기>
     expandedItems는 확장된 상태의 아이템 ID들을 저장하는 배열로 확장 여부 추적
     기본은 43자까지만 표시 -> 클릭 시 전체 내용 -> 재클릭시 접힘
    */
    const [expandedItems, setExpandedItems] = useState<number[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    
    /* 항목 확장/축소 토글 기능 구현 */
    const itemToggle = (id: number) =>{
        setExpandedItems((prev) =>
            prev.includes(id) ? prev.filter((x)=>x!==id) : [...prev, id]
        );
    };
    
    /*페이지네이션 처리*/
    const indexOfLast = currentPage * itemsPerPage; // 현재 페이지에서 끝에 해당하는 배열 인덱스
    const indexOfFirst = indexOfLast - itemsPerPage; // 현재 페이지의 첫 번째 항목 인덱스
    const currentInquiries = inquiries.slice(indexOfFirst, indexOfLast); // 실제 현재 페이지에 보여줄 항목들의 배열
    
    const totalPages = Math.ceil(inquiries.length / itemsPerPage); // 전체 페이지 수(마지막 페이지 번호)

    /* 이미지 선택 처리 */
    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>, index: number) => {
        if (!e.target.files) return;
        const file = e.target.files[0];
        const url = URL.createObjectURL(file);

        setImages((prev) => {
            const copy = [...prev];
            copy[index] = url;
            return copy;
        });
        
        setImageFiles((prev) => {
            const copy = [...prev];
            copy[index] = file;
            return copy;
        });
    }
    /* 이미지 삭제 처리 */
    const handleImageRemove = (index: number) => {
        setImages((prev) => {
            const copy = [...prev];
            copy.splice(index, 1);
            return copy;
        });
        
        setImageFiles((prev) => {
            const copy = [...prev];
            copy.splice(index, 1);
            return copy;
        });
    }

    /* 문의 내용 변경 처리 */
    const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
    }

    /* 등록 버튼 활성화 여부 
    inquiryType !== ""  :문의 유형이 선택됨
    content.trim() !== "" : 내용이 공백이 아님 
    */
    const isFormValid = inquiryType !== "" && content.trim() !== "";
    
    
    return (
        <div className={cn("background")}>
            <div className={cn("customer")}>
                <h1 className={cn("title")}>고객 문의</h1>

                <div className={cn("tabMenu")}>
                    <button
                        className={cn("tab", {active: activeTab === "history"})}
                        onClick={() => setActiveTab("history")}
                    >
                        문의 내역
                    </button>
                    <button
                        className={cn("tab", {active: activeTab === "register"})}
                        onClick={() => setActiveTab("register")}
                    >
                        문의 등록
                    </button>
                </div>
                
                <div className={cn("tabContent")}>
                    {activeTab === "history" && (
                        loading ? (
                            <div className={cn("loadingBox")}>
                                <p className={cn("loadingMessage")}>문의 내역을 불러오는 중...</p>
                            </div>
                        ) : error ? (
                            <div className={cn("errorBox")}>
                                <p className={cn("errorMessage")}>{error}</p>
                                <button onClick={fetchInquiries} className={cn("retryBtn")}>다시 시도</button>
                            </div>
                        ) : inquiries.length === 0 ? (
                            <div className={cn("emptyBox")}>
                                <p className={cn("emptyMessage")}>문의하신 내역이 없어요.</p>
                            </div>
                        ) : (
                        <>
                            <ul className={cn("inquiryList")}>
                                {currentInquiries.map((item, index) => {
                                    const isExpanded = expandedItems.includes(item.id);
                                    const isLong = item.content.length > 41; // 글자 수 42가 최대
                                    const displayContent = isExpanded || !isLong 
                                    ? item.content 
                                    : item.content.slice(0,41) +"...";
                                return(
                                    <li key={item.id || `inquiry-${index}`} className={cn("inquiryItem")}>
                                        <span className={cn("status", 
                                            {waiting: item.status==="답변 대기", 
                                            done: item.status==="답변 보기"})}
                                            onClick={() => openModal(item.answer || null)}
                                        > 
                                            {item.status}
                                        </span>
                                        <p className={cn("content")}>
                                            {displayContent}
                                            {isLong && (
                                                <a onClick={() => itemToggle(item.id)}
                                                > {isExpanded ? " 접기":" 더보기"}
                                                </a>
                                            )}
                                        </p>

                                        {/* 이미지 표시*/}
                                        {item.image && (
                                            <div className={cn("imageWrapper")}>
                                                <Image 
                                                src={item.image}
                                                alt="문의 이미지"
                                                width={200}
                                                height={150}
                                                className={cn("inquiryImage")}/>
                                            </div>

                                        )}

                                        <div className={cn("dateTime")}>
                                            <span className={cn("date")}>{item.date}</span>
                                            <span className={cn("time")}>{item.time}</span>
                                        </div>
                                    </li>
                                );
                            })}
                            </ul>
                            {/*Pagenation*/}
                            {totalPages > 1 && (
                                <div className={cn("pagination")}>
                                    <button 
                                    disabled={currentPage===1}
                                    onClick={() => setCurrentPage((p) => p-1)}
                                    > {"<"} 
                                    </button>
                                    {Array.from({length: totalPages }, (_,i) => (
                                        <button
                                            key={i}
                                            className={cn({activate: currentPage === i+1})}
                                            onClick={() => setCurrentPage(i+1)}
                                        >
                                            {i+1}
                                        </button>
                                    ))}
                                    <button 
                                        disabled={currentPage===totalPages}
                                        onClick={() => setCurrentPage((p) => p+1)}
                                    >
                                        {">"} 
                                    </button>
                                </div>
                            )}
                        </>
                        )  
                    )}

                    {activeTab === "register" && (
                        <form className={cn("registerForm")} onSubmit={handleSubmit}>
                            <div className={cn("formGroup")}>
                                <label>문의 유형</label>
                                <div className={cn("customSelectWrapper")}>
                                <select 
                                    className={cn("customSelect")}
                                    value={inquiryType}
                                    onChange={(e) => setInquiryType(e.target.value)}>
                                        <option value="" disabled>문의 유형을 선택하세요</option>
                                        <option value="help">도움 요청</option>
                                        <option value="uncomfortable">서비스 이용 불편</option>
                                        <option value="proposal">서비스 개선 제안</option>
                                        <option value="etc">기타</option>
                                    </select>
                                </div>
                            </div>
                            <div className={cn("formGroup")}>
                                <label>문의 내용</label>
                                <textarea 
                                className={cn("customSelect")} // 동일한 폼으로 맞추기 위해 클래스 재사용
                                value={content}
                                onChange={handleContentChange}
                                placeholder='문의 내용을 작성해주세요.'
                                />
                            </div>

                            {/* 관련 이미지 업로드 영영 추가 */}
                            <div className={cn("formGroup")}>
                                <label>관련 이미지</label>
                                <div className={cn("imageUploadArea")}>
                                    {/* 이미지 업로드 슬롯 1 (index0) */}
                                    {[0,1].map((index) => (
                                        <div key={index} className={cn("imageSlot")}>
                                            {images[index] ? (
                                                // 이미지가 있을 경우 미리보기와 삭제 버튼 표시
                                                <div className={cn("imagePreview")}>
                                                    <Image src={images[index]} alt={`문의 이미지 ${index+1}`} width={100} height={100} />
                                                    <button 
                                                        type="button" 
                                                        className={cn("removeImageBtn")}
                                                        onClick={() => handleImageRemove(index)}
                                                    >
                                                        &times;
                                                    </button>
                                                </div>
                                            ):(
                                                // 이미지가 없을 경우 업로드 버튼(label)
                                                <label htmlFor={`image-upload-${index}`} className={cn("uploadLabel")}>
                                                    <span className={cn("plusIcon")}>+</span>
                                                    <input id={`image-upload-${index}`}
                                                    type="file"
                                                    accept="image/*"
                                                    className={cn("hiddenFileInput")}
                                                    onChange={(e) => handleImageUpload(e, index)}
                                                    />
                                                </label>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* 등록 버튼 추가 */}
                            <button 
                            type="submit"
                            className={cn("submitBtn", {disabled: !isFormValid || loading})}
                            disabled={!isFormValid || loading}
                            >{loading ? '등록 중...' : '등록하기'}</button>
                            {error && (
                                <div className={cn("errorMessage")}>
                                    {error}
                                </div>
                            )}
                        </form>
                    )}
                </div>
            </div>

            {/* 답변 내용 모달 */}
            {isModalOpen && (
                <div className={cn("modalOverlay")} onClick={closeModal}>
                    <div className={cn("modalContent")} onClick={(e) => e.stopPropagation()}>
                        <h2>답변 내용</h2>
                        <button className={cn("closeBtn")} onClick={closeModal}>x</button>
                        <pre className={cn("answerText")}>{selectedAnswer}</pre>
                    </div>
                </div>
            )}
        </div>
    );
}