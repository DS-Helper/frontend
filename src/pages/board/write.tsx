"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { useRouter } from "next/router";
import classNames from "classnames/bind";
import styles from "../../styles/Board.module.scss";
import { boardWriteCategories, BoardPostCategory } from "@/types/board";
import { patchBoard, postBoard } from "@/lib/apis/board";
import { BsCardImage } from "react-icons/bs";
import { IoIosArrowDown, IoMdClose } from "react-icons/io";

const cn = classNames.bind(styles);
const MAX_UPLOAD_IMAGE_SIZE_MB = 10;
const MAX_UPLOAD_IMAGE_SIZE_BYTES = MAX_UPLOAD_IMAGE_SIZE_MB * 1024 * 1024;

/** POST /boards ?�답?�서 ?�성??게시글 id 추출 (백엔???�드�?차이 ?�?? */
function getCreatedBoardIdFromResponse(body: unknown): string | null {
  if (body == null || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;
  const direct = o.id ?? o.boardId;
  if (direct != null && String(direct).trim() !== "") {
    return String(direct);
  }
  const wrapped = o.data;
  if (wrapped && typeof wrapped === "object" && !Array.isArray(wrapped)) {
    const w = wrapped as Record<string, unknown>;
    const inner = w.id ?? w.boardId;
    if (inner != null && String(inner).trim() !== "") {
      return String(inner);
    }
  }
  return null;
}

export default function BoardWritePage() {
  const router = useRouter();
  const categoryDropdownRef = useRef<HTMLDivElement | null>(null);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [category, setCategory] = useState<BoardPostCategory | "">("");
  const [title, setTitle] = useState("");
  const [contentTop, setContentTop] = useState("");
  const [contentBottom, setContentBottom] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const contentTopRef = useRef<HTMLTextAreaElement>(null);
  const contentBottomRef = useRef<HTMLTextAreaElement>(null);
  const boardImageFileInputRef = useRef<HTMLInputElement>(null);
  const prevImagePreviewCountRef = useRef(0);
  const [hasPrefilledEditData, setHasPrefilledEditData] = useState(false);
  const isEditMode = router.query.mode === "edit";

  const openBoardImagePicker = () => {
    if (imageFiles.length > 0) {
      alert("?��?지???�나�??�로?��? 가?�합?�다.");
      return;
    }
    boardImageFileInputRef.current?.click();
  };

  const syncTextareaHeights = () => {
    for (const ref of [contentTopRef, contentBottomRef]) {
      const el = ref.current;
      if (!el) continue;
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }
  };

  useLayoutEffect(() => {
    syncTextareaHeights();
  }, [contentTop, contentBottom, imagePreviewUrls.length]);

  useEffect(() => {
    const onResize = () => syncTextareaHeights();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!categoryOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      const el = categoryDropdownRef.current;
      if (el && !el.contains(e.target as Node)) setCategoryOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCategoryOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [categoryOpen]);

  useLayoutEffect(() => {
    const urls = imageFiles.map((file) => URL.createObjectURL(file));
    setImagePreviewUrls(urls);
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imageFiles]);

  useEffect(() => {
    if (!router.isReady || !isEditMode || hasPrefilledEditData) return;
    const query = router.query;
    const boardId = typeof query.boardId === "string" ? query.boardId : "";
    const categoryFromQuery =
      typeof query.category === "string" ? query.category : "";
    const titleFromQuery = typeof query.title === "string" ? query.title : "";
    const contentFromQuery =
      typeof query.content === "string" ? query.content : "";
    const imageUrlFromQuery =
      typeof query.imageUrl === "string" ? query.imageUrl : "";

    if (boardId) {
      if (boardWriteCategories.includes(categoryFromQuery as BoardPostCategory)) {
        setCategory(categoryFromQuery as BoardPostCategory);
      }
      setTitle(titleFromQuery);
      setContentTop(contentFromQuery);
      setContentBottom("");
      setExistingImageUrl(imageUrlFromQuery.trim() || null);
    }
    setHasPrefilledEditData(true);
  }, [router.isReady, router.query, isEditMode, hasPrefilledEditData]);

  /** �??��?지 첨�?�??�래 textarea가 ?��??????�동 ?�커??*/
  useLayoutEffect(() => {
    const n = imagePreviewUrls.length;
    const prev = prevImagePreviewCountRef.current;
    prevImagePreviewCountRef.current = n;
    if (prev === 0 && n > 0) {
      contentBottomRef.current?.focus();
    }
  }, [imagePreviewUrls.length]);

  /** ?��?지�??��? ?�거?�면 ?�겨지???�래 �??�용????본문???�침 */
  useEffect(() => {
    if (imageFiles.length > 0) return;
    setContentBottom((bottom) => {
      const tail = bottom.trim();
      if (!tail) return bottom;
      setContentTop((t) => {
        const head = t.trim();
        return head ? `${head}\n\n${tail}` : tail;
      });
      return "";
    });
  }, [imageFiles.length]);

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const list = input.files;
    if (!list?.length) return;
    if (imageFiles.length > 0) {
      alert("?��?지???�나�??�로?��? 가?�합?�다.");
      input.value = "";
      return;
    }
    const selectedFile = list[0];
    if (selectedFile.size > MAX_UPLOAD_IMAGE_SIZE_BYTES) {
      alert(`?��?지??${MAX_UPLOAD_IMAGE_SIZE_MB}MB ?�하�??�로?�할 ???�습?�다.`);
      input.value = "";
      return;
    }
    // input.value�?비우�?FileList가 즉시 비워?? 배치??setState ?�데?�터가 �?목록???�을 ???�음 (textarea ?�커?????�히 ???�현??
    const added = [selectedFile];
    input.value = "";
    setExistingImageUrl(null);
    setImageFiles(added);
  };

  const removeImageAt = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const mergedContent = [contentTop.trim(), contentBottom.trim()]
    .filter(Boolean)
    .join("\n\n");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !title.trim() || !mergedContent) {
      alert("카테고리, ?�목, ?�용??모두 ?�력??주세??");
      return;
    }
    setSubmitting(true);
    try {
      if (isEditMode) {
        const boardId =
          typeof router.query.boardId === "string" ? router.query.boardId : "";
        if (!boardId.trim()) {
          alert("?�정??게시글 ?�보�?찾을 ???�습?�다.");
          return;
        }
        const res = await patchBoard({
          dto: {
            boardId: boardId.trim(),
            title: title.trim(),
            content: mergedContent,
            keepImageUrls: existingImageUrl ? [existingImageUrl] : null,
          },
          ...(imageFiles.length > 0 ? { images: imageFiles } : {}),
        });
        if (res && (res.status === 200 || res.status === 201)) {
          await router.push(`/board/${boardId}`);
          return;
        }
        alert("게시글 ?�정???�패?�습?�다. ?�시 ?�도??주세??");
        return;
      }

      const res = await postBoard({
        dto: {
          category: category as BoardPostCategory,
          title: title.trim(),
          content: mergedContent,
        },
        ...(imageFiles.length > 0 ? { images: imageFiles } : {}),
      });

      if (res && (res.status === 200 || res.status === 201)) {
        const newId = getCreatedBoardIdFromResponse(res.data);
        if (newId) {
          await router.push(`/board/${newId}`);
          return;
        }
        alert(
          "게시글?� ?�록?�었?�나 ?�세 ?�이지�??�동???�보가 ?�습?�다. 목록?�서 ?�인??주세??",
        );
        return;
      }
      alert("게시글 ?�록???�패?�습?�다. ?�시 ?�도??주세??");
    } catch {
      alert("게시글 ?�록 �??�류가 발생?�습?�다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={cn("writePage")}>
      <form className={cn("writeForm")} onSubmit={handleSubmit}>
        <div className={cn("writeFieldGroup")}>
          <span id="board-category-label" className={cn("visuallyHidden")}>
            카테고리
          </span>
          <div
            ref={categoryDropdownRef}
            className={cn("writeCategoryDropdown")}
          >
            <button
              type="button"
              id="board-category-trigger"
              className={cn("writeCategoryTrigger", {
                writeCategoryPlaceholder: !category,
                writeCategoryTriggerOpen: categoryOpen,
              })}
              aria-label="카테고리 ?�택"
              aria-expanded={categoryOpen}
              aria-haspopup="listbox"
              aria-controls="board-category-listbox"
              onClick={() => setCategoryOpen((o) => !o)}
            >
              <span className={cn("writeCategoryTriggerText")}>
                {category || "카테고리�??�택?�주?�요."}
              </span>
              <IoIosArrowDown
                className={cn("writeCategoryChevron")}
                aria-hidden
              />
            </button>
            {categoryOpen && (
              <ul
                id="board-category-listbox"
                className={cn("writeCategoryList")}
                role="listbox"
                aria-labelledby="board-category-label"
              >
                {boardWriteCategories.map((c) => (
                  <li key={c} className={cn("writeCategoryItem")} role="none">
                    <button
                      type="button"
                      role="option"
                      className={cn("writeCategoryOption", {
                        writeCategoryOptionSelected: category === c,
                      })}
                      aria-selected={category === c}
                      onClick={() => {
                        setCategory(c);
                        setCategoryOpen(false);
                      }}
                    >
                      {c}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className={cn("writeEditorCard")}>
          <label htmlFor="board-title" className={cn("visuallyHidden")}>
            ?�목
          </label>
          <input
            id="board-title"
            type="text"
            className={cn("writeTitleInput")}
            placeholder="?�목???�력?�세??"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            spellCheck={false}
          />
          <label htmlFor="board-content" className={cn("visuallyHidden")}>
            ?�용
          </label>
          <div className={cn("writeContentStack")}>
            <div className={cn("writeEditorColumn")}>
              <div className={cn("writeContentField")}>
                <textarea
                  ref={contentTopRef}
                  id="board-content"
                  className={cn(
                    "writeContentInput",
                    "writeContentInputPrimary",
                    {
                      writeContentInputPrimaryWithMedia:
                        imagePreviewUrls.length > 0,
                    },
                  )}
                  placeholder="?�용???�력?�세??"
                  value={contentTop}
                  onChange={(e) => {
                    setContentTop(e.target.value);
                    const el = e.target;
                    el.style.height = "auto";
                    el.style.height = `${el.scrollHeight}px`;
                  }}
                  spellCheck={false}
                />

                {imagePreviewUrls.map((url, idx) => (
                  <p
                    key={`${url}-${idx}`}
                    className={cn("writeImageParagraph")}
                    aria-label={`첨�? ?��?지 ${idx + 1}`}
                  >
                    <img
                      src={url}
                      alt=""
                      className={cn("writeImagePreviewImg")}
                    />
                    <button
                      type="button"
                      className={cn("writeImagePreviewRemove")}
                      onClick={() => removeImageAt(idx)}
                      aria-label={`첨�? ?��?지 ${idx + 1} ?�거`}
                    >
                      <IoMdClose className={cn("writeImagePreviewRemoveIcon")} aria-hidden />
                    </button>
                  </p>
                ))}
                {imagePreviewUrls.length === 0 && existingImageUrl && (
                  <p className={cn("writeImageParagraph")} aria-label="기존 첨�? ?��?지">
                    <img
                      src={existingImageUrl}
                      alt=""
                      className={cn("writeImagePreviewImg")}
                    />
                    <button
                      type="button"
                      className={cn("writeImagePreviewRemove")}
                      onClick={() => setExistingImageUrl(null)}
                      aria-label="기존 첨�? ?��?지 ?�거"
                    >
                      <IoMdClose className={cn("writeImagePreviewRemoveIcon")} aria-hidden />
                    </button>
                  </p>
                )}

                {imagePreviewUrls.length > 0 && (
                  <>
                    <label
                      htmlFor="board-content-after"
                      className={cn("visuallyHidden")}
                    >
                      ?��?지 ?�래 ?�용
                    </label>
                    <textarea
                      ref={contentBottomRef}
                      id="board-content-after"
                      className={cn(
                        "writeContentInput",
                        "writeContentInputFollowUp",
                      )}
                      value={contentBottom}
                      onChange={(e) => {
                        setContentBottom(e.target.value);
                        const el = e.target;
                        el.style.height = "auto";
                        el.style.height = `${el.scrollHeight}px`;
                      }}
                      spellCheck={false}
                    />
                  </>
                )}

                <div className={cn("writeImageToolbar")}>
                  <input
                    ref={boardImageFileInputRef}
                    type="file"
                    accept="image/*"
                    className={cn("writeFileInputHidden")}
                    onChange={handleFilesChange}
                    tabIndex={-1}
                    aria-hidden
                  />
                  <button
                    type="button"
                    className={cn("writeImageButton")}
                    onClick={openBoardImagePicker}
                    aria-label="?��?지 ?�일 ?�택"
                  >
                    <BsCardImage className={cn("writeImageIcon")} aria-hidden />
                    ?��?지 ?�로??
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={cn("writeActions")}>
          <button
            type="submit"
            className={cn("writeConfirmButton")}
            disabled={submitting}
          >
            {submitting ? "?�록 중�? : "?�인"}
          </button>
          <button
            type="button"
            className={cn("writeCancelButton")}
            onClick={() => router.back()}
            disabled={submitting}
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
}
