export interface IdiomItem {
  id: number;
  word: string;
  meaning: string;
  example: string;
  category: 'motivation' | 'daily' | 'teamwork' | 'learning' | 'success';
}

export const IDIOMS_BANK: IdiomItem[] = [
  {
    id: 1,
    word: 'Break a leg!',
    meaning: 'Ungkapan untuk mendoakan seseorang agar sukses, percaya diri, dan memberikan performa terbaik.',
    example: 'You have practiced your speech all week. Break a leg on the stage!',
    category: 'success'
  },
  {
    id: 2,
    word: 'Piece of cake',
    meaning: 'Sesuatu yang sangat mudah untuk dipelajari, dikerjakan, atau diselesaikan.',
    example: 'Don’t worry about the English vocabulary quiz, it is going to be a piece of cake.',
    category: 'daily'
  },
  {
    id: 3,
    word: 'Bite the bullet',
    meaning: 'Menghadapi situasi sulit atau tantangan dengan penuh keberanian dan ketegaran.',
    example: 'I was nervous to speak in front of everyone, but I bit the bullet and did it.',
    category: 'motivation'
  },
  {
    id: 4,
    word: 'Hit the books',
    meaning: 'Mulai belajar dengan giat, disiplin, dan fokus penuh.',
    example: 'Midterm exams are approaching next week, so it’s time to hit the books!',
    category: 'learning'
  },
  {
    id: 5,
    word: 'Burn the midnight oil',
    meaning: 'Belajar atau bekerja keras hingga larut malam demi menggapai target impian.',
    example: 'The English Club committee burned the midnight oil preparing the annual competition.',
    category: 'motivation'
  },
  {
    id: 6,
    word: 'Call it a day',
    meaning: 'Menyudahi kegiatan atau pekerjaan hari ini karena target sudah tercapai dengan baik.',
    example: 'We have rehearsed three speaking rounds today. Let’s call it a day and get some rest.',
    category: 'daily'
  },
  {
    id: 7,
    word: 'Once in a blue moon',
    meaning: 'Sesuatu peristiwa yang sangat langka atau sangat jarang sekali terjadi.',
    example: 'A mentor missing an English Club session only happens once in a blue moon.',
    category: 'daily'
  },
  {
    id: 8,
    word: 'Spill the beans',
    meaning: 'Menceritakan rahasia atau membocorkan kejutan sebelum waktunya.',
    example: 'Who spilled the beans about our upcoming English camp agenda?',
    category: 'daily'
  },
  {
    id: 9,
    word: 'Under the weather',
    meaning: 'Kondisi tubuh sedang merasa kurang fit, meriang, atau tidak enak badan.',
    example: 'I felt a bit under the weather yesterday, but today I am ready to practice speaking.',
    category: 'daily'
  },
  {
    id: 10,
    word: 'The best of both worlds',
    meaning: 'Mendapatkan dua keuntungan sekaligus dari dua situasi atau pilihan yang berbeda.',
    example: 'Joining English Club gives you the best of both worlds: fun friendships and sharp language skills.',
    category: 'success'
  },
  {
    id: 11,
    word: 'Going the extra mile',
    meaning: 'Berusaha melampaui standar biasa dan memberikan dedikasi ekstra terbaik.',
    example: 'Chandra is always going the extra mile to make our club portal awesome.',
    category: 'motivation'
  },
  {
    id: 12,
    word: 'Hit the nail on the head',
    meaning: 'Menyatakan pendapat yang sangat tepat sasaran atau menebak kebenaran dengan akurat.',
    example: 'Your analysis of the debate topic hit the nail on the head.',
    category: 'learning'
  },
  {
    id: 13,
    word: 'Kill two birds with one stone',
    meaning: 'Menyelesaikan dua urusan atau meraih dua manfaat sekaligus dalam satu tindakan cerdas.',
    example: 'Reading English tech articles lets you learn programming and expand your vocabulary at the same time.',
    category: 'learning'
  },
  {
    id: 14,
    word: 'Miss the boat',
    meaning: 'Terlambat memanfaatkan kesempatan emas yang sudah terbuka lebar.',
    example: 'Register for the speech contest now before you miss the boat!',
    category: 'motivation'
  },
  {
    id: 15,
    word: 'On cloud nine',
    meaning: 'Merasa luar biasa gembira, bangga, dan dipenuhi rasa syukur.',
    example: 'The team was on cloud nine after winning first place in the regional debate.',
    category: 'success'
  },
  {
    id: 16,
    word: 'See eye to eye',
    meaning: 'Sepakat sepenuhnya dan memiliki pandangan yang seirama satu sama lain.',
    example: 'All mentors see eye to eye on making this semester more interactive.',
    category: 'teamwork'
  },
  {
    id: 17,
    word: 'Through thick and thin',
    meaning: 'Selalu setia saling mendukung baik di masa-masa lancar maupun saat menghadapi rintangan.',
    example: 'Our English Club family sticks together through thick and thin.',
    category: 'teamwork'
  },
  {
    id: 18,
    word: 'Time flies',
    meaning: 'Waktu terasa berlalu begitu cepat tanpa terasa karena diisi kegiatan yang seru.',
    example: 'Time flies when you are having fun practicing conversation with your peers.',
    category: 'daily'
  },
  {
    id: 19,
    word: 'Wrap your head around',
    meaning: 'Berhasil memahami sebuah konsep atau aturan tata bahasa yang awalnya rumit.',
    example: 'It takes a little patience to wrap your head around English conditional sentences.',
    category: 'learning'
  },
  {
    id: 20,
    word: 'Actions speak louder than words',
    meaning: 'Tindakan nyata dan bukti perbuatan jauh lebih bermakna daripada sekadar janji lisan.',
    example: 'Show your commitment to learning English; actions speak louder than words.',
    category: 'motivation'
  },
  {
    id: 21,
    word: 'Back to the drawing board',
    meaning: 'Merancang kembali rencana dari awal dengan lebih matang setelah percobaan pertama belum berhasil.',
    example: 'Our first rehearsal had some audio issues, so it’s back to the drawing board.',
    category: 'learning'
  },
  {
    id: 22,
    word: 'Every cloud has a silver lining',
    meaning: 'Selalu ada hikmah dan pelajaran berharga di balik setiap kesulitan atau kegagalan.',
    example: 'Making mistakes in pronunciation taught us the correct accent; every cloud has a silver lining.',
    category: 'motivation'
  },
  {
    id: 23,
    word: 'Fit as a fiddle',
    meaning: 'Kondisi kesehatan yang sangat bugar, segar, dan prima.',
    example: 'After a good night’s sleep, she was as fit as a fiddle for the presentation.',
    category: 'daily'
  },
  {
    id: 24,
    word: 'Hang in there',
    meaning: 'Tetap bertahan, tabah, dan jangan menyerah di tengah proses perjuangan.',
    example: 'English fluency takes continuous practice. Hang in there and keep talking!',
    category: 'motivation'
  },
  {
    id: 25,
    word: 'Keep your chin up',
    meaning: 'Tetap tegakkan kepala dan peliharalah rasa percaya diri saat menghadapi tantangan.',
    example: 'Keep your chin up! Every great speaker started by stuttering in their first speech.',
    category: 'motivation'
  },
  {
    id: 26,
    word: 'Make a long story short',
    meaning: 'Meringkas cerita atau penjelasan panjang langsung ke inti pokoknya.',
    example: 'To make a long story short, we passed the selection and reached the finals.',
    category: 'daily'
  },
  {
    id: 27,
    word: 'No pain, no gain',
    meaning: 'Tidak ada pencapaian besar tanpa kerja keras, keringat, dan disiplin.',
    example: 'Mastering 500 new words requires persistence; remember, no pain, no gain.',
    category: 'motivation'
  },
  {
    id: 28,
    word: 'Out of the blue',
    meaning: 'Terjadi secara tiba-tiba tanpa ada tanda atau pemberitahuan sebelumnya.',
    example: 'Out of the blue, the teacher gave us an impromptu storytelling challenge.',
    category: 'daily'
  },
  {
    id: 29,
    word: 'Practice makes perfect',
    meaning: 'Latihan rutin yang berulang adalah kunci utama untuk mencapai keahlian sempurna.',
    example: 'Keep chatting in English during club hours. Practice makes perfect!',
    category: 'learning'
  },
  {
    id: 30,
    word: 'Step up your game',
    meaning: 'Meningkatkan standar usaha dan kualitas performa ke tingkat yang lebih tinggi.',
    example: 'If you want to compete nationally, you need to step up your game.',
    category: 'motivation'
  },
  {
    id: 31,
    word: 'Take it easy',
    meaning: 'Tenangkan diri, santai, dan nikmati momen tanpa perlu merasa tertekan.',
    example: 'Don’t stress out before taking the mic. Take it easy and breathe.',
    category: 'daily'
  },
  {
    id: 32,
    word: 'Think outside the box',
    meaning: 'Berpikir kreatif dan inovatif melampaui batas-batas cara pandang konvensional.',
    example: 'The drama team thought outside the box to deliver a hilarious modern fairy tale.',
    category: 'learning'
  },
  {
    id: 33,
    word: 'Weather the storm',
    meaning: 'Mampu bertahan dan melangkah maju melewati masa-masa krisis atau rintangan berat.',
    example: 'With solid cooperation, our club can weather any storm.',
    category: 'teamwork'
  },
  {
    id: 34,
    word: 'You rock!',
    meaning: 'Ungkapan apresiasi tulus bahwa seseorang telah melakukan hal yang sangat hebat dan luar biasa.',
    example: 'Thank you for helping clean up after the meeting. You rock!',
    category: 'success'
  },
  {
    id: 35,
    word: 'Barking up the wrong tree',
    meaning: 'Mencari penyebab atau solusi di tempat yang keliru atau menuduh arah yang salah.',
    example: 'If you think memorizing grammar rules alone makes you fluent, you are barking up the wrong tree.',
    category: 'learning'
  },
  {
    id: 36,
    word: 'Curiosity killed the cat',
    meaning: 'Rasa ingin tahu yang berlebihan tanpa etika bisa membawa kerugian atau masalah.',
    example: 'Respect your friend’s privacy; remember that curiosity killed the cat.',
    category: 'daily'
  },
  {
    id: 37,
    word: 'Don’t judge a book by its cover',
    meaning: 'Jangan menilai kualitas atau kepribadian seseorang hanya dari penampilan luarnya saja.',
    example: 'He seems quiet, but on stage he is a fierce orator. Don’t judge a book by its cover.',
    category: 'daily'
  },
  {
    id: 38,
    word: 'Feeling blue',
    meaning: 'Sedang merasa sedih, murung, atau suasana hati sedang mendung.',
    example: 'Singing English songs together always helps when someone is feeling blue.',
    category: 'daily'
  },
  {
    id: 39,
    word: 'Ignorance is bliss',
    meaning: 'Terkadang tidak mengetahui detail rumit tertentu justru membawa kedamaian pikiran.',
    example: 'I didn’t know how many judges were watching until after my speech; ignorance was bliss!',
    category: 'daily'
  },
  {
    id: 40,
    word: 'Jump on the bandwagon',
    meaning: 'Ikut-ikutan mengikuti tren atau aktivitas yang sedang viral dan populer.',
    example: 'Many students jumped on the bandwagon to join the English podcast project.',
    category: 'daily'
  },
  {
    id: 41,
    word: 'Pull someone’s leg',
    meaning: 'Menggoda atau bercanda santai dengan teman tanpa ada maksud jahat.',
    example: 'Relax, there is no surprise pop quiz today; I was just pulling your leg!',
    category: 'daily'
  },
  {
    id: 42,
    word: 'Speak of the devil',
    meaning: 'Orang yang baru saja dibicarakan tiba-tiba muncul di hadapan kita.',
    example: 'We were just discussing Chandra’s new update, and speak of the devil, here he comes!',
    category: 'daily'
  },
  {
    id: 43,
    word: 'Steal someone’s thunder',
    meaning: 'Mengambil perhatian atau sorotan yang seharusnya menjadi hak orang lain.',
    example: 'Let Anggi announce her debate championship first; don’t steal her thunder.',
    category: 'teamwork'
  },
  {
    id: 44,
    word: 'Take with a grain of salt',
    meaning: 'Menyaring informasi dan tidak menelan mentah-mentah kabar yang belum terverifikasi.',
    example: 'Take online rumors with a grain of salt until the official BPH announces it.',
    category: 'daily'
  },
  {
    id: 45,
    word: 'Up in the air',
    meaning: 'Rencana atau keputusan yang masih mengambang dan belum diputuskan secara final.',
    example: 'The exact location for our outdoor picnic gathering is still up in the air.',
    category: 'teamwork'
  },
  {
    id: 46,
    word: 'Run out of steam',
    meaning: 'Kehabisan energi atau daya tahan fisik setelah beraktivitas intens.',
    example: 'After three hours of continuous debates, both teams started to run out of steam.',
    category: 'daily'
  },
  {
    id: 47,
    word: 'Cry over spilled milk',
    meaning: 'Menyesali kekeliruan masa lalu yang sudah terlanjur terjadi dan tidak bisa diulang.',
    example: 'We lost a few points in grammar, but don’t cry over spilled milk; focus on the next round.',
    category: 'motivation'
  },
  {
    id: 48,
    word: 'Cost an arm and a leg',
    meaning: 'Sesuatu yang harganya sangat mahal atau membutuhkan biaya sangat besar.',
    example: 'Imported English books used to cost an arm and a leg before digital libraries existed.',
    category: 'daily'
  },
  {
    id: 49,
    word: 'Ahead of the curve',
    meaning: 'Berada di garis depan inovasi dan lebih maju dibandingkan standar pada umumnya.',
    example: 'Using a digital tactile attendance portal puts SMEGA English Club ahead of the curve.',
    category: 'success'
  },
  {
    id: 50,
    word: 'Sky is the limit',
    meaning: 'Tidak ada batasan untuk apa yang bisa kamu capai selama kamu terus berjuang.',
    example: 'Believe in your English skills, Chandra. The sky is the limit!',
    category: 'success'
  }
];

/**
 * Mengambil 1 idiom acak dari bank idiom.
 */
export function getRandomIdiom(): IdiomItem {
  const index = Math.floor(Math.random() * IDIOMS_BANK.length);
  return IDIOMS_BANK[index];
}

/**
 * Mengambil idiom mingguan yang konsisten berdasarkan tanggal pertemuan / pekan kalender.
 */
export function getWeeklyIdiom(dateStr?: string): IdiomItem {
  const targetDate = dateStr ? new Date(dateStr) : new Date();
  const startOfYear = new Date(targetDate.getFullYear(), 0, 1);
  const daysDiff = Math.floor((targetDate.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((daysDiff + startOfYear.getDay() + 1) / 7);

  const idiomIndex = Math.abs(weekNumber) % IDIOMS_BANK.length;
  return IDIOMS_BANK[idiomIndex];
}
