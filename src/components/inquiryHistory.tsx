// 문의 내역 탭
import React from "react";
import styles from '@/styles/Customer.module.scss';
import classNames from 'classnames/bind';

const cn = classNames.bind(styles);

const inquiryData = [
    {
        id: 1,
        status: "답변 보기",
        content:"신청 당시에 부모님이 병원에 가시는 일정이 있어서 ...",
        date:"2025.07.15",
        time:"17:38",
        answer:"안녕하세요. 불편을 드려 정말 죄송합니다. \n\n확인 결과, 해당 시간대에 배차 배경이 누락된 것으로 확인되었습니다. \n\n빠르게 연락을 드리지 못한 점 사과드리며, 다음 일정은 저희가 우선 배정해드릴 수 있도록 처리하겠습니다.\n\n다시 한 번 사과드리며, 곧 별도 연락드리겠습니다."
    }
];

