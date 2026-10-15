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
  },
  {
    id: 51,
    word: 'Cut corners',
    meaning: 'Mengambil jalan pintas atau cara cepat yang mengorbankan kualitas demi menghemat waktu atau biaya.',
    example: 'When building secure software, you should never cut corners on testing and validation.',
    category: 'learning'
  },
  {
    id: 52,
    word: 'Face the music',
    meaning: 'Menerima konsekuensi atau kenyataan pahit atas tindakan sendiri dengan penuh tanggung jawab.',
    example: 'He forgot to submit the debate registration, so he had to face the music and apologize.',
    category: 'motivation'
  },
  {
    id: 53,
    word: 'At the drop of a hat',
    meaning: 'Melakukan sesuatu secara spontan, seketika, dan tanpa ragu sedikit pun.',
    example: 'Our English mentors are ready to help anyone practice speaking at the drop of a hat.',
    category: 'daily'
  },
  {
    id: 54,
    word: 'Blessing in disguise',
    meaning: 'Hal baik atau hikmah berharga yang awalnya tampak seperti kesialan atau kemunduran.',
    example: 'Missing the bus was a blessing in disguise because I met a new study partner while waiting.',
    category: 'motivation'
  },
  {
    id: 55,
    word: 'By the skin of your teeth',
    meaning: 'Berhasil lolos atau menyelesaikan sesuatu hanya dengan selisih waktu atau skor yang sangat tipis.',
    example: 'He caught the train by the skin of his teeth just before the doors closed.',
    category: 'success'
  },
  {
    id: 56,
    word: 'Beat around the bush',
    meaning: 'Berbicara berbelit-belit atau menghindari topik inti pembicaraan.',
    example: 'Stop beating around the bush and tell us your idea for the English drama competition.',
    category: 'daily'
  },
  {
    id: 57,
    word: 'Hit the sack',
    meaning: 'Pergi tidur untuk beristirahat setelah seharian beraktivitas produktif.',
    example: 'It has been a productive gathering today; now it’s time to hit the sack and recharge.',
    category: 'daily'
  },
  {
    id: 58,
    word: 'A dime a dozen',
    meaning: 'Sesuatu yang sangat umum, mudah ditemukan di mana-mana, dan kurang memiliki keunikan khusus.',
    example: 'Generic ideas are a dime a dozen, but bold execution is what truly counts.',
    category: 'learning'
  },
  {
    id: 59,
    word: 'Cutting edge',
    meaning: 'Inovasi, teknologi, atau metode paling mutakhir dan paling terdepan di bidangnya.',
    example: 'SMEGA students always strive to build cutting-edge web applications.',
    category: 'success'
  },
  {
    id: 60,
    word: 'Pull yourself together',
    meaning: 'Menenangkan emosi, mengendalikan diri, dan bersikap tenang kembali setelah menghadapi kepanikan.',
    example: 'Take a deep breath and pull yourself together before stepping onto the stage.',
    category: 'motivation'
  },
  {
    id: 61,
    word: 'Leave no stone unturned',
    meaning: 'Mengerahkan segala daya upaya dan memeriksa setiap opsi yang ada demi menemukan solusi.',
    example: 'The research team left no stone unturned to find credible evidence for the debate.',
    category: 'learning'
  },
  {
    id: 62,
    word: 'On the ball',
    meaning: 'Cekatan, waspada, dan sangat tanggap dalam memahami serta merespons situasi dengan cepat.',
    example: 'The student council committee is really on the ball with event scheduling this semester.',
    category: 'success'
  },
  {
    id: 63,
    word: 'Get the ball rolling',
    meaning: 'Memulai langkah perdana suatu kegiatan atau proyek bersama agar prosesnya segera berjalan.',
    example: 'Let’s introduce ourselves in English to get the ball rolling this afternoon.',
    category: 'teamwork'
  },
  {
    id: 64,
    word: 'Throw in the towel',
    meaning: 'Menyerah dalam perjuangan (biasanya digunakan sebagai pengingat agar pantang mundur).',
    example: 'English speaking might feel challenging at first, but never throw in the towel!',
    category: 'motivation'
  },
  {
    id: 65,
    word: 'Burn bridges',
    meaning: 'Merusak hubungan baik secara permanen sehingga menutup kesempatan kerja sama di masa depan.',
    example: 'Always be polite when leaving an organization; you never want to burn bridges.',
    category: 'daily'
  },
  {
    id: 66,
    word: 'Break the ice',
    meaning: 'Mencairkan suasana kaku dan canggung saat pertama kali berkumpul dengan orang-orang baru.',
    example: 'Playing a quick vocabulary trivia game helped break the ice among the new members.',
    category: 'teamwork'
  },
  {
    id: 67,
    word: 'Spill the tea',
    meaning: 'Menceritakan kabar hangat, fakta menarik, atau informasi seru yang sedang ramai dibahas.',
    example: 'Come on, spill the tea! How did the English storytelling championship go yesterday?',
    category: 'daily'
  },
  {
    id: 68,
    word: 'A breath of fresh air',
    meaning: 'Sesuatu yang baru, menyegarkan, dan membawa energi positif yang menyenangkan.',
    example: 'Her creative presentation style was a breath of fresh air in today’s seminar.',
    category: 'motivation'
  },
  {
    id: 69,
    word: 'Raining cats and dogs',
    meaning: 'Hujan yang turun sangat lebat dan deras diiringi angin kencang.',
    example: 'We had to hold our English meeting indoors because it was raining cats and dogs outside.',
    category: 'daily'
  },
  {
    id: 70,
    word: 'Cross your fingers',
    meaning: 'Berharap atau mendoakan hasil yang terbaik atas sesuatu yang sedang dinanti.',
    example: 'Keep your fingers crossed while the jury tallies the final speech scores!',
    category: 'daily'
  },
  {
    id: 71,
    word: 'Bend over backwards',
    meaning: 'Berusaha sekuat tenaga dan rela berkorban demi menolong atau memuaskan rekan lain.',
    example: 'The senior mentors bent over backwards to ensure every junior felt welcomed.',
    category: 'teamwork'
  },
  {
    id: 72,
    word: 'Bring home the bacon',
    meaning: 'Meraih keberhasilan gemilang atau membawa pulang trofi kemenangan bagi komunitas.',
    example: 'The SMEGA English Club delegates worked hard and brought home the bacon at the province level.',
    category: 'success'
  },
  {
    id: 73,
    word: 'Catch someone red-handed',
    meaning: 'Memergoki seseorang tepat pada saat dia sedang melakukan suatu kesalahan.',
    example: 'The teacher caught him red-handed reading a comic book under the desk.',
    category: 'daily'
  },
  {
    id: 74,
    word: 'Down to the wire',
    meaning: 'Situasi kompetisi atau tenggat waktu yang sangat sengit dan mendebarkan hingga detik terakhir.',
    example: 'The debate final was down to the wire, but our team delivered a killer closing statement.',
    category: 'motivation'
  },
  {
    id: 75,
    word: 'Elephant in the room',
    meaning: 'Masalah besar dan jelas yang disadari semua orang, tetapi dihindari untuk dibicarakan karena canggung.',
    example: 'Nobody wanted to mention the sudden deadline change, but it was clearly the elephant in the room.',
    category: 'teamwork'
  },
  {
    id: 76,
    word: 'From scratch',
    meaning: 'Mulai merintis atau membuat sesuatu murni dari awal tanpa bantuan bahan instan.',
    example: 'Chandra designed the entire tactile attendance system from scratch using React.',
    category: 'learning'
  },
  {
    id: 77,
    word: 'Get out of hand',
    meaning: 'Situasi atau kondisi yang mulai kacau dan lepas dari batas kendali.',
    example: 'The banter in the classroom started to get out of hand, so the mentor stepped in.',
    category: 'daily'
  },
  {
    id: 78,
    word: 'Give someone the cold shoulder',
    meaning: 'Bersikap dingin, cuek, atau sengaja mengabaikan keberadaan seseorang.',
    example: 'Instead of giving each other the cold shoulder, let’s talk through our differences openly.',
    category: 'daily'
  },
  {
    id: 79,
    word: 'Go down in flames',
    meaning: 'Mengalami kegagalan total yang dramatis, namun memberikan pelajaran berharga untuk introspeksi.',
    example: 'Their first pitch went down in flames, but they regrouped and won the next competition.',
    category: 'learning'
  },
  {
    id: 80,
    word: 'Head in the clouds',
    meaning: 'Suka berkhayal atau memikirkan hal-hal yang tidak realistis terhadap situasi nyata.',
    example: 'It’s good to dream big, but don’t keep your head in the clouds without taking real action.',
    category: 'daily'
  },
  {
    id: 81,
    word: 'In the heat of the moment',
    meaning: 'Bertindak atau berbicara spontan karena terpengaruh emosi sesaat tanpa pertimbangan matang.',
    example: 'He said some harsh words in the heat of the moment, but he apologized shortly after.',
    category: 'daily'
  },
  {
    id: 82,
    word: 'Keep an eye on',
    meaning: 'Mengawasi, memantau, atau memperhatikan perkembangan sesuatu dengan cermat.',
    example: 'Please keep an eye on the event timer while the speaker delivers their presentation.',
    category: 'teamwork'
  },
  {
    id: 83,
    word: 'Let the cat out of the bag',
    meaning: 'Tidak sengaja membocorkan rahasia atau kejutan sebelum waktu pengumuman resmi.',
    example: 'Don’t let the cat out of the bag about the surprise guest speaker for next week!',
    category: 'daily'
  },
  {
    id: 84,
    word: 'Method to the madness',
    meaning: 'Alasan rasional atau rencana terstruktur yang cerdas di balik hal yang tampak kacau.',
    example: 'His unique speaking rehearsal looked strange, but there was a clear method to the madness.',
    category: 'learning'
  },
  {
    id: 85,
    word: 'Off the hook',
    meaning: 'Terbebas dari kewajiban berat, masalah rumit, atau tuduhan yang membayangi.',
    example: 'Since Doni had already submitted his homework, he was completely off the hook.',
    category: 'daily'
  },
  {
    id: 86,
    word: 'On the same page',
    meaning: 'Memiliki kesepakatan, visi, dan pemahaman yang selaras dalam suatu tim kerja.',
    example: 'Before we start the English project, let’s make sure everyone is on the same page.',
    category: 'teamwork'
  },
  {
    id: 87,
    word: "Play devil's advocate",
    meaning: 'Mengambil sudut pandang berlawanan secara sengaja untuk menguji kekuatan dan ketajaman suatu ide.',
    example: 'In critical debate training, playing devil’s advocate helps us discover hidden weaknesses.',
    category: 'learning'
  },
  {
    id: 88,
    word: 'Pull out all the stops',
    meaning: 'Mengerahkan seluruh sumber daya dan daya upaya maksimal tanpa menahan diri demi keberhasilan.',
    example: 'The English Club pulled out all the stops to make the graduation farewell unforgettable.',
    category: 'motivation'
  },
  {
    id: 89,
    word: 'Put all eggs in one basket',
    meaning: 'Mempertaruhkan seluruh modal, tenaga, atau harapan pada satu pilihan tunggal yang berisiko.',
    example: 'Diversify your skills across writing and speaking; never put all your eggs in one basket.',
    category: 'learning'
  },
  {
    id: 90,
    word: 'Read between the lines',
    meaning: 'Memahami makna tersirat atau maksud sesungguhnya yang tidak terucap secara langsung.',
    example: 'If you read between the lines, you can tell the mentor was truly impressed by your essay.',
    category: 'learning'
  },
  {
    id: 91,
    word: 'Light at the end of the tunnel',
    meaning: 'Titik terang harapan atau tanda keberhasilan setelah melalui perjuangan dan masa-masa sulit.',
    example: 'After weeks of rigorous vocabulary drills, the students finally saw the light at the end of the tunnel.',
    category: 'motivation'
  },
  {
    id: 92,
    word: 'Stand on your own two feet',
    meaning: 'Menjadi pribadi yang mandiri, percaya diri, dan mampu memikul tanggung jawab sendiri.',
    example: 'Joining vocational education teaches us to stand on our own two feet early on.',
    category: 'motivation'
  },
  {
    id: 93,
    word: 'Strike while the iron is hot',
    meaning: 'Mengambil tindakan tegas pada saat peluang emas sedang berada di kondisi paling menguntungkan.',
    example: 'You feel motivated right now, so strike while the iron is hot and register for the contest.',
    category: 'success'
  },
  {
    id: 94,
    word: 'Take the bull by the horns',
    meaning: 'Menghadapi masalah rumit atau tantangan besar secara langsung dengan gagah berani.',
    example: 'Instead of hiding from public speaking anxiety, take the bull by the horns and practice.',
    category: 'motivation'
  },
  {
    id: 95,
    word: 'The ball is in your court',
    meaning: 'Giliran atau keputusan berikutnya kini berada di tanganmu untuk menentukan langkah.',
    example: 'We have offered you the role of head delegate; the ball is now in your court.',
    category: 'teamwork'
  },
  {
    id: 96,
    word: 'Throw caution to the wind',
    meaning: 'Berani mengambil langkah berani dan mengabaikan rasa takut atau keraguan demi maju.',
    example: 'She threw caution to the wind and delivered an impromptu speech without any notes.',
    category: 'motivation'
  },
  {
    id: 97,
    word: 'To make matters worse',
    meaning: 'Membuat situasi yang tadinya sudah sulit menjadi bertambah rumit atau merepotkan.',
    example: 'It started raining, and to make matters worse, we left our umbrellas in the classroom.',
    category: 'daily'
  },
  {
    id: 98,
    word: 'Two heads are better than one',
    meaning: 'Kolaborasi dan bertukar pikiran berdua selalu membuahkan ide yang lebih hebat dibanding sendirian.',
    example: 'Let’s brainstorm the speech script together; two heads are definitely better than one.',
    category: 'teamwork'
  },
  {
    id: 99,
    word: 'Under the radar',
    meaning: 'Bergerak atau berkarya dengan tenang tanpa menarik perhatian atau sorotan berlebih.',
    example: 'He practiced speaking consistently under the radar and surprised everyone at the championship.',
    category: 'daily'
  },
  {
    id: 100,
    word: 'Win-win situation',
    meaning: 'Situasi atau kesepakatan yang mendatangkan keuntungan dan kepuasan yang adil bagi kedua belah pihak.',
    example: 'Peer mentoring creates a win-win situation where both senior and junior learners grow.',
    category: 'teamwork'
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
