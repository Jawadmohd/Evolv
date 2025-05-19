// Gallery.jsx
import React from 'react';
import './gallery.css';
import Layout from './Layout';

// Filenames; assets must live in public/assets/
const imageList = [
  'mw1.jpg',
  'mw2.jpg',
  'mw3.jpg',
  'mw4.jpg',
  'mw5.jpg',
  'mw6.jpg',
  'mw7.jpg',
  'wc1.jpg',
  'wc2.jpg',
  'wc3.jpg',
  'wc4.jpg',
  'wc5.jpg',
];

const Gallery = () => (
  <Layout>
    <div className="gallery-container">
      <h1>Photo Gallery</h1>
      <div className="gallery-grid">
        {imageList.map((filename) => {
          const src = `${process.env.PUBLIC_URL}/assets/${filename}`;
          return (
            <div key={filename} className="gallery-item">
              <img src={src} alt={filename} />
              <a href={src} download={filename} className="download-btn">
                Download
              </a>
            </div>
          );
        })}
      </div>
    </div>
  </Layout>
);

export default Gallery;
