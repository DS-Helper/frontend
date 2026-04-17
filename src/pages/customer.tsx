// 고객 문의 ?�이지
import styles from "../styles/Customer.module.scss";
import classNames from 'classnames/bind';
import React, { useState, useEffect, ChangeEvent, useRef, useCallback } from "react";
import { getInquiries, postInquiry } from '@/lib/apis/customer';
import { Inquiry } from '@/types/customer';
import { IoIosArrowDown } from "react-icons/io";
import Image from 'next/image';
import AnswerModal from '@/components/Modal/AnswerModal';

const cn = classNames.bind(styles);

const INQUIRY_TYPE_OPTIONS = [
    { value: "help", label: "?��? ?�청" },
    { value: "uncomfortable", label: "?�비???�용 불편" },
    { value: "proposal", label: "?�비??개선 ?�안" },
    { value: "etc", label: "기�?" },
] as const;

export default function Customer(){
    const [activeTab, setActiveTab] = useState<"history" | "register">('history');
    const [inquiryType, setInquiryType] = useState(""); //문의 ?�??
    const [inquiryTypeMenuOpen, setInquiryTypeMenuOpen] = useState(false);
    const inquiryTypeDropdownRef = useRef<HTMLDivElement>(null);
    const [content, setContent] = useState("");
    const inquiryContentRef = useRef<HTMLTextAreaElement>(null);
    const [images, setImages] = useState<string[]>([]); // 미리보기 URL 배열
    const [imageFiles, setImageFiles] = useState<File[]>([]); // ?�제 ?�일 객체 배열
    
    // API?�서 가?�온 문의 ?�이??
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // 문의 ?�역 불러?�기
    const fetchInquiries = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getInquiries();
            if (response && response.data) {
                // 배열?��? ?�인?�고 ?�전?�게 ?�정
                const data = response.data;
                let rawInquiries: any[] = [];
                
                if (Array.isArray(data)) {
                    rawInquiries = data;
                } else if (Array.isArray(data.inquiries)) {
                    rawInquiries = data.inquiries;
                } else if (Array.isArray(data.items)) {
                    rawInquiries = data.items;
                } else {
                    console.error('?�상?��? 못한 ?�답 구조:', data);
                    setInquiries([]);
                    setError('문의 ?�역 ?�이???�식???�바르�? ?�습?�다.');
                    return;
                }
                
                // API ?�답??Inquiry ?�식?�로 매핑
                const mappedInquiries: Inquiry[] = rawInquiries.map((item: any) => {
                    // ?�짜?� ?�간 분리 (createdAt: "2025-11-09 22:20")
                    const createdAt = item.createdAt || item.date || '';
                    const [date, time] = createdAt.split(' ');
                    
                    // ?��?지 URL 처리
                    const imageUrl = item.imageUrls && item.imageUrls.length > 0 
                        ? item.imageUrls[0] 
                        : (item.image || undefined);
                    
                    return {
                        id: item.inquiryId || item.id,
                        status: item.status || (item.reply ? "?��? 보기" : "?��? ?��?),
                        content: item.content || '',
                        date: date || '',
                        time: time || '',
                        image: imageUrl,
                        imageUrls: item.imageUrls || [],
                        reply: item.reply || null,
                        answer: item.reply?.content || item.answer || null, // ?�환?�을 ?�해 answer???�정
                    };
                });
                
                setInquiries(mappedInquiries);
            } else {
                setInquiries([]);
                setError('문의 ?�역??불러?�는???�패?�습?�다.');
            }
        } catch (err) {
            setInquiries([]);
            setError('문의 ?�역??불러?�는 �??�류가 발생?�습?�다.');
            console.error('문의 ?�역 불러?�기 ?�류:', err);
        } finally {
            setLoading(false);
        }
    };

    // 컴포?�트 마운????문의 ?�역 불러?�기
    useEffect(() => {
        if (activeTab === 'history') {
            fetchInquiries();
        }
    }, [activeTab]);

    // ?��? ?�용 모달
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    
    const openModal = (answer: string | null) => {
        console.log('openModal called with answer:', answer);
        if (!answer || answer.trim() === '') {
            console.log('Answer is empty, not opening modal');
            return; // ?��? ?�는 경우 ?�릭 x
        }
        console.log('Setting modal state');
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
            // FormData ?�성
            const formData = new FormData();
            
            // dto 객체 ?�성 �?JSON 문자?�로 변??
            const dto = {
                type: inquiryType === "help" ? "?��? ?�청" :
                      inquiryType === "uncomfortable" ? "?�비???�용 불편" :
                      inquiryType === "proposal" ? "?�비??개선 ?�안" :
                      inquiryType === "etc" ? "기�?" : inquiryType,
                content: content
            };
            
            // dto�?JSON 문자?�로 추�?
            formData.append('dto', JSON.stringify(dto));
            
            // ?��?지 ?�일 추�?
            imageFiles.forEach((file) => {
                formData.append('images', file);
            });
            
            const response = await postInquiry(formData);
            console.log('문의 ?�록 ?�답:', response);
            
            // ?�답???�고 ?�태 코드가 200번�?�??�공?�로 간주
            if (response && (response.status === 200 || response.status === 201)) {
                alert('문의가 ?�공?�으�??�록?�었?�니??');
                // ??초기??
                setInquiryType('');
                setContent('');
                setImages([]);
                setImageFiles([]);
                // 문의 ?�역 ??���??�동?�고 ?�이???�로고침
                setActiveTab('history');
                await fetchInquiries();
            } else {
                setError('문의 ?�록???�패?�습?�다.');
            }
        } catch (err) {
            setError('문의 ?�록 �??�류가 발생?�습?�다.');
            console.error('문의 ?�록 ?�류:', err);
        } finally {
            setLoading(false);
        }
    };

    /*
     <?�보�?
     expandedItems???�장???�태???�이??ID?�을 ?�?�하??배열�??�장 ?��? 추적
     기본?� 43?�까지�??�시 -> ?�릭 ???�체 ?�용 -> ?�클�?�� ?�힘
    */
    const [expandedItems, setExpandedItems] = useState<(string | number)[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    
    /* ??�� ?�장/축소 ?��? 기능 구현 */
    const itemToggle = (id: string | number) =>{
        setExpandedItems((prev) =>
            prev.includes(id) ? prev.filter((x)=>x!==id) : [...prev, id]
        );
    };
    
    /*?�이지?�이??처리*/
    const indexOfLast = currentPage * itemsPerPage; // ?�재 ?�이지?�서 ?�에 ?�당?�는 배열 ?�덱??
    const indexOfFirst = indexOfLast - itemsPerPage; // ?�재 ?�이지??�?번째 ??�� ?�덱??
    const currentInquiries = inquiries.slice(indexOfFirst, indexOfLast); // ?�제 ?�재 ?�이지??보여�???��?�의 배열
    
    const totalPages = Math.ceil(inquiries.length / itemsPerPage); // ?�체 ?�이지 ??마�?�??�이지 번호)

    /* ?��?지 ?�택 처리 */
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
    /* ?��?지 ??�� 처리 */
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

    const adjustInquiryContentHeight = useCallback(() => {
        const el = inquiryContentRef.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = `${el.scrollHeight}px`;
    }, []);

    useEffect(() => {
        adjustInquiryContentHeight();
    }, [content, adjustInquiryContentHeight]);

    useEffect(() => {
        if (activeTab === "register") {
            adjustInquiryContentHeight();
        }
    }, [activeTab, adjustInquiryContentHeight]);

    useEffect(() => {
        if (activeTab !== "register") setInquiryTypeMenuOpen(false);
    }, [activeTab]);

    useEffect(() => {
        if (!inquiryTypeMenuOpen) return;
        const close = (e: MouseEvent) => {
            if (inquiryTypeDropdownRef.current && !inquiryTypeDropdownRef.current.contains(e.target as Node)) {
                setInquiryTypeMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", close);
        return () => document.removeEventListener("mousedown", close);
    }, [inquiryTypeMenuOpen]);

    useEffect(() => {
        if (!inquiryTypeMenuOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setInquiryTypeMenuOpen(false);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [inquiryTypeMenuOpen]);

    /* 문의 ?�용 변�?처리 */
    const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
    };

    /* ?�록 버튼 ?�성???��? 
    inquiryType !== ""  :문의 ?�형???�택??
    content.trim() !== "" : ?�용??공백???�님 
    */
    const isFormValid = inquiryType !== "" && content.trim() !== "";
    
    // 문의 ??�� 컴포?�트
    const InquiryItem = ({ item, isExpanded, onToggle, onOpenModal }: {
        item: Inquiry;
        isExpanded: boolean;
        onToggle: (id: string | number) => void;
        onOpenModal: (answer: string | null) => void;
    }) => {
        const contentRef = useRef<HTMLParagraphElement>(null);
        const [isLong, setIsLong] = useState(false);

        useEffect(() => {
            if (contentRef.current) {
                // ?�스?��? ??줄을 ?�어가?��? 체크
                const lineHeight = parseFloat(getComputedStyle(contentRef.current).lineHeight);
                const isOverflowing = contentRef.current.scrollHeight > lineHeight * 1.5; // ?�간???�유�???
                setIsLong(isOverflowing);
            }
        }, [item.content]);

        return (
            <li className={cn("inquiryItem")}>
                <span 
                    className={cn("status", 
                        {waiting: item.status==="?��? ?��?, 
                        done: item.status==="?��? 보기"})}
                    onClick={() => {
                        console.log('Status clicked, item:', item);
                        console.log('item.reply:', item.reply);
                        console.log('item.answer:', item.answer);
                        console.log('item.status:', item.status);
                        const answerContent = item.reply?.content || item.answer;
                        if (item.status === "?��? 보기" && answerContent) {
                            onOpenModal(answerContent);
                        }
                    }}
                    style={{ cursor: item.status === "?��? 보기" ? 'pointer' : 'default' }}
                > 
                    {item.status}
                </span>
                <p 
                    ref={contentRef}
                    className={cn("content", { truncated: isLong && !isExpanded })}
                >
                    <span className={cn("contentText")}>{item.content}</span>
                    {isLong && (
                        <a onClick={() => onToggle(item.id)} className={cn("moreLink")}>
                            {isExpanded ? " ?�기" : " ?�보�?}
                        </a>
                    )}
                </p>

                {/* ?��?지 ?�시*/}
                {item.image && (
                    <div className={cn("imageWrapper")}>
                        <Image 
                        src={item.image}
                        alt="문의 ?��?지"
                        className={cn("inquiryImage")}
                        width={426}
                        height={213}
                        />
                    </div>
                )}

                <div className={cn("dateTime")}>
                    <span className={cn("date")}>{item.date}</span>
                    <span className={cn("time")}>({item.time})</span>
                </div>
            </li>
        );
    };
    
    return (
        <div className={cn("background")}>
            <div className={cn("customer")}>
                <h1 className={cn("title")}>고객 문의</h1>

                <div className={cn("tabMenu")}>
                    <button
                        className={cn("tab", {active: activeTab === "history"})}
                        onClick={() => setActiveTab("history")}
                    >
                        문의 ?�역
                    </button>
                    <button
                        className={cn("tab", {active: activeTab === "register"})}
                        onClick={() => setActiveTab("register")}
                    >
                        문의 ?�록
                    </button>
                </div>
                
                <div className={cn("tabContent")}>
                    {activeTab === "history" && (
                        loading ? (
                            <div className={cn("loadingBox")}>
                                <p className={cn("emptyMessage")}>문의 ?�역??불러?�는 �?..</p>
                            </div>
                        ) : inquiries.length === 0 ? (
                            <div className={cn("emptyBox")}>
                                <p className={cn("emptyMessage")}>문의?�신 ?�역???�어??</p>
                            </div>
                        ) : (
                        <>
                            <ul className={cn("inquiryList")}>
                                {currentInquiries.map((item, index) => {
                                    return (
                                        <InquiryItem
                                            key={item.id || `inquiry-${index}`}
                                            item={item}
                                            isExpanded={expandedItems.includes(item.id)}
                                            onToggle={itemToggle}
                                            onOpenModal={openModal}
                                        />
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
                                <div className={cn("formGroupLabel")}>
                                    <label id="inquiryTypeLabel" className={cn("inquiryFormLabel")}>
                                        문의 ?�형
                                        <span className={cn("requiredIcon", "inquiryRequiredMark")} aria-hidden="true">
                                            *
                                        </span>
                                    </label>
                                </div>
                                <div
                                    className={cn("customSelectWrapper", "inquiryTypeField")}
                                    ref={inquiryTypeDropdownRef}>
                                    <button
                                        type="button"
                                        className={cn("inquiryTypeTrigger", {
                                            inquiryTypeTriggerPlaceholder: inquiryType === "",
                                        })}
                                        onClick={() => setInquiryTypeMenuOpen((o) => !o)}
                                        aria-haspopup="listbox"
                                        aria-expanded={inquiryTypeMenuOpen}
                                        aria-controls="inquiryTypeListbox"
                                        aria-labelledby="inquiryTypeLabel">
                                        <span className={cn("inquiryTypeTriggerText")}>
                                            {inquiryType === ""
                                                ? "\u200b"
                                                : INQUIRY_TYPE_OPTIONS.find((o) => o.value === inquiryType)?.label}
                                        </span>
                                        <IoIosArrowDown
                                            className={cn("inquiryTypeChevron", {
                                                inquiryTypeChevronOpen: inquiryTypeMenuOpen,
                                            })}
                                            aria-hidden
                                        />
                                    </button>
                                    {inquiryTypeMenuOpen && (
                                        <ul
                                            id="inquiryTypeListbox"
                                            className={cn("inquiryTypeList")}
                                            role="listbox"
                                            aria-labelledby="inquiryTypeLabel">
                                            {INQUIRY_TYPE_OPTIONS.map((opt) => (
                                                <li key={opt.value} role="presentation">
                                                    <button
                                                        type="button"
                                                        role="option"
                                                        aria-selected={inquiryType === opt.value}
                                                        className={cn("inquiryTypeOption", {
                                                            inquiryTypeOptionActive: inquiryType === opt.value,
                                                        })}
                                                        onClick={() => {
                                                            setInquiryType(opt.value);
                                                            setInquiryTypeMenuOpen(false);
                                                        }}>
                                                        {opt.label}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                            <div className={cn("formGroup")}>
                                <div className={cn("formGroupLabel")}>
                                    <label>문의 ?�용</label>
                                    <span className={cn("requiredIcon")}>*</span>
                                </div>
                                <textarea
                                    ref={inquiryContentRef}
                                    className={cn("customSelect")}
                                    value={content}
                                    rows={1}
                                    spellCheck={false}
                                    onChange={handleContentChange}
                                />
                            </div>

                            {/* 관???��?지 ?�로???�영 추�? */}
                            <div className={cn("formGroup")}>
                                <label>관???��?지</label>
                                <div className={cn("imageUploadArea")}>
                                    <div className={cn("imageSlot")}>
                                        {images[0] ? (
                                            <div className={cn("imagePreview")}>
                                                <Image src={images[0]} alt="문의 ?��?지" width={100} height={100} />
                                                <button
                                                    type="button"
                                                    className={cn("removeImageBtn")}
                                                    onClick={() => handleImageRemove(0)}
                                                >
                                                    &times;
                                                </button>
                                            </div>
                                        ) : (
                                            <label htmlFor="image-upload-0" className={cn("uploadLabel")}>
                                                <span className={cn("uploadPlusCircle")}>
                                                    <span className={cn("plusIcon")}>+</span>
                                                </span>
                                                <input
                                                    id="image-upload-0"
                                                    type="file"
                                                    accept="image/*"
                                                    className={cn("hiddenFileInput")}
                                                    onChange={(e) => handleImageUpload(e, 0)}
                                                />
                                            </label>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {/* ?�록 버튼 추�? */}
                            <button 
                            type="submit"
                            className={cn("submitBtn", {disabled: !isFormValid || loading})}
                            disabled={!isFormValid || loading}
                            >{loading ? '?�록 �?..' : '?�록?�기'}</button>
                            {error && (
                                <div className={cn("errorMessage")}>
                                    {error}
                                </div>
                            )}
                        </form>
                    )}
                </div>
            </div>

            {/* ?��? ?�용 모달 */}
            {isModalOpen && selectedAnswer && (
                <>
                    {console.log('Rendering AnswerModal, isModalOpen:', isModalOpen, 'selectedAnswer:', selectedAnswer)}
                    <AnswerModal 
                        answer={selectedAnswer} 
                        onClose={closeModal}
                    />
                </>
            )}
        </div>
    );
}