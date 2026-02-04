"use client";

import classNames from "classnames/bind";
import styles from "@/styles/Pagination.module.scss";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";

const cn = classNames.bind(styles);

const MAX_VISIBLE_PAGES = 6;

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function getVisiblePages(currentPage: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= MAX_VISIBLE_PAGES) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages: (number | "ellipsis")[] = [];
  const showLeft = currentPage > 2;
  const showRight = currentPage < totalPages - 1;

  pages.push(1);
  if (showLeft && currentPage > 3) pages.push("ellipsis");

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);
  for (let i = start; i <= end; i++) {
    if (i !== 1 && i !== totalPages) pages.push(i);
  }

  if (showRight && currentPage < totalPages - 2) pages.push("ellipsis");
  if (totalPages > 1) pages.push(totalPages);

  return pages;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 0) return null;

  const visiblePages = getVisiblePages(currentPage, totalPages);

  return (
    <nav className={cn("pagination")} aria-label="페이지 네비게이션">
      <button
        type="button"
        className={cn("navButton")}
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage <= 1}
        aria-label="이전 페이지"
      >
        <FaAngleLeft className={cn("navButtonIcon")} />
      </button>
      <div className={cn("pageNumbers")}>
        {visiblePages.map((page, index) =>
          page === "ellipsis" ? (
            <span key={`ellipsis-${index}`} className={cn("ellipsis")}>
              …
            </span>
          ) : (
            <button
              key={page}
              type="button"
              className={cn("pageButton", { active: currentPage === page })}
              onClick={() => onPageChange(page)}
              aria-label={`${page}페이지`}
              aria-current={currentPage === page ? "page" : undefined}
            >
              {page}
            </button>
          )
        )}
      </div>
      <button
        type="button"
        className={cn("navButton")}
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage >= totalPages}
        aria-label="다음 페이지"
      >
        <FaAngleRight className={cn("navButtonIcon")} />
      </button>
    </nav>
  );
}
