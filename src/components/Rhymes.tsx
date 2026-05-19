import React from 'react';
import { RHYME_VIDEOS } from '../data/rhymeData';
import VideoPlayer from './VideoPlayer';

const Rhymes: React.FC = () => {
  return <VideoPlayer videos={RHYME_VIDEOS} />;
};

export default Rhymes;
