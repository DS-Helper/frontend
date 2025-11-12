'use client';

import { useState, useEffect, useCallback } from "react";
import { useRouter } from 'next/router';
import classNames from "classnames/bind";
import styles from "./HelpStoryDetail.module.scss";
import { getPost } from "@/lib/apis/helpStory";
import Image from "next/image";

const cn = classNames.bind(styles);

interface Post {
  postId: string;
  title: string;
  content: string;
  writerName: string;
  imageUrls: string[];
  createdAt: string;
}

export default function HelpStoryDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPost = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getPost(id as string);
      
      if (response && response.data) {
        setPost(response.data);
      } else {
        console.error('게시글 데이터가 없습니다.');
        router.push('/helpStory');
      }
    } catch (error) {
      console.error('도와드린 이야기 조회 실패:', error);
      router.push('/helpStory');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (router.isReady && id) {
      fetchPost();
    }
  }, [router.isReady, id, fetchPost]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[date.getDay()];
    
    return `${year}.${month}.${day} (${weekday})`;
  };

  const isValidImageUrl = (url: string | null | undefined): boolean => {
    if (!url) return false;
    if (url.includes('null')) return false;
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === 'https:' || parsedUrl.protocol === 'http:';
    } catch {
      return false;
    }
  };

  // 주석 처리된 공유 기능을 위한 함수 (현재 사용하지 않음)
  // const handleShare = async () => {
  //   if (navigator.share) {
  //     try {
  //       await navigator.share({
  //         title: post?.title || '도와드린 이야기',
  //         text: post?.content || '',
  //         url: window.location.href,
  //       });
  //     } catch {
  //       // 사용자가 공유를 취소한 경우
  //       console.log('공유가 취소되었습니다.');
  //     }
  //   } else {
  //     // 공유 API를 지원하지 않는 경우 클립보드에 복사
  //     try {
  //       await navigator.clipboard.writeText(window.location.href);
  //       alert('링크가 클립보드에 복사되었습니다.');
  //     } catch (err) {
  //       console.error('클립보드 복사 실패:', err);
  //       alert('공유 기능을 사용할 수 없습니다.');
  //     }
  //   }
  // };

  if (!router.isReady || loading) {
    return (
      <div className={cn("container")}>
        <div className={cn("loading")}>
          <p>도와드린 이야기를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className={cn("container")}>
        <div className={cn("error")}>
          <p>게시글을 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  const mainImage = post.imageUrls && post.imageUrls.length > 0 && isValidImageUrl(post.imageUrls[0])
    ? post.imageUrls[0]
    : null;

  return (
    <div className={cn("container")}>
      <main className={cn("main")}>
        <article className={cn("article")}>
          <header className={cn("header")}>
            <h1 className={cn("title")}>{post.title}</h1>
            <time className={cn("date")}>{formatDate(post.createdAt)}</time>
          </header>

          {mainImage && (
            <div className={cn("imageWrapper")}>
              <Image
                src={mainImage}
                alt={post.title}
                width={800}
                height={600}
                className={cn("mainImage")}
                priority
              />
            </div>
          )}

          <div className={cn("content")}>
            <p className={cn("contentText")}>{post.content}</p>
          </div>

          {/* <div className={cn("shareSection")}>
            <button className={cn("shareButton")} onClick={handleShare}>
              <IoShareOutline className={cn("shareIcon")} />
              공유하기
            </button>
          </div> */}
        </article>
      </main>
    </div>
  );
}

