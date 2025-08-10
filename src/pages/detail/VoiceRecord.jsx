import React from 'react';
import VoiceRecordCard from '../../components/detail/VoiceRecordCard';


const records = [
  {
    id: 1,
    name: '엄마와의 통화 기록',
    date: '2025.08.23',
    duration: '3:15',
    emoji: '🧑‍🦲',
    suspicious: true,
    score: 88,
  },
  {
    id: 2,
    name: '아빠와의 통화 기록',
    date: '2025.08.23',
    duration: '1:15',
    emoji: '🤠',
    suspicious: false,
  },
  {
    id: 3,
    name: '이모와의 통화 기록',
    date: '2025.08.23',
    duration: '3:20',
    emoji: '👩‍🦳',
    suspicious: false,
  },
  {
    id: 4,
    name: '큰아빠와의 통화 기록',
    date: '2025.08.23',
    duration: '5:30',
    emoji: '🧕',
    suspicious: true,
    score: 88,
  },
];

const VoiceRecordList = () => {
  return (
    <div className="VoiceRecord_wrap container">
      <div className="header">
        <button className="back">{'<'}</button>
        <h2>음성기록</h2>
        <button className="filter">≡</button>
      </div>

      <div className="search-bar">
        <input type="text" placeholder="Search...." />
      </div>

      <div className="record-list">
        {records.map((record) => (
          <VoiceRecordCard key={record.id} record={record} />
        ))}
      </div>
    </div>
  );
};

export default VoiceRecordList;
