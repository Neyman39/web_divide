const mainImage = document.querySelector('.main-image');
const thumbnails = document.querySelectorAll('.thumbnail');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');

let currentIndex = 0;

function showImage(index) {
  mainImage.src = thumbnails[index].src;
  thumbnails.forEach(thumbnail => thumbnail.classList.remove('active'));
  thumbnails[index].classList.add('active');
}

prevBtn.addEventListener('click', () => {
  currentIndex = (currentIndex - 1 + thumbnails.length) % thumbnails.length;
  showImage(currentIndex);
});

nextBtn.addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % thumbnails.length;
  showImage(currentIndex);
});

thumbnails.forEach((thumbnail, index) => {
  thumbnail.addEventListener('click', () => {
    currentIndex = index;
    showImage(currentIndex);
  });
});
