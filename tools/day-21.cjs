// День дороги: пользователь уточнил направление и заменил 6:56 на 8:30.
// Вылет сохранён после переезда в примечании, без назначения времени/части суток.
module.exports=[{
 number:21,date:'понедельник, 31 мая',title:'Токио',jp:'東京',color:'#26344D',
 status:'ready',cover:'d21-haneda-user-cover.jpg',coverAlt:'Самолёты у терминала аэропорта Ханэда на фоне горы Фудзи',
 coverBrief:'Отдельный вид Токио для обложки: городской пейзаж, подходящий для кадрирования 4:3 и 16:9. Не повтор снимка другого дня.',
 lead:'Последний день в Японии: утром едем из T-CAT в аэропорт Ханэда, затем вылетаем домой.',
 planLead:'Дорога в аэропорт и возвращение домой.',
 stops:[],
 rows:[{
  time:'8:30',name:'T-CAT → Ханэда, терминал 3',
  jp:'東京シティエアターミナル → 羽田空港第3ターミナル',
  ch:'Shuttle Bus или метро',note:'Затем вылетаем домой.'
 }],
 research:{
  checked:'2026-11-17',visit:'2027-05-31',confirmedForVisit:false,
  userClarification:'выезд из Tokyo City Air Terminal (T-CAT) в Haneda Terminal 3   в 8:30 утра',
  originalTime:'6:56',departureTime:'8:30',flightTime:null,
  sources:[
   'https://www.tcat-hakozaki.co.jp/en/airport/haneda.html',
   'https://www.tcat-hakozaki.co.jp/',
   'https://www.tokyo-haneda.com/en/access/bus/index.html?tab=terminal3'
  ],
  note:'Направление автобусного сообщения и японские названия сверены по официальным страницам. 8:30 — плановое время пользователя, не подтверждённый рейс на май 2027. Вариант метро сохранён без назначения линий, станций, пересадок, длительности и цены. Время вылета не указано.'
 }
}];
