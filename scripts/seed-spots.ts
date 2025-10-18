import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Координаты популярных мест в Москве
const moscowSpots = [
  {
    title: "Парковка у Красной площади",
    description: "Удобная парковка в самом центре Москвы, рядом с Красной площадью и ГУМом",
    address: "Красная площадь, 1, Москва",
    geoLat: 55.7539,
    geoLng: 37.6208,
    pricePerHour: 20000, // 200 рублей
    covered: false,
    guarded: true,
    camera: true,
    evCharging: false,
    disabledAccessible: true,
    wideEntrance: true,
    accessType: "STREET" as const,
    rules: "Парковка только для легковых автомобилей",
    sizeL: 4.5,
    sizeW: 2.0,
    sizeH: 2.2
  },
  {
    title: "Парковка у ТЦ Афимолл",
    description: "Крытая парковка в торговом центре с круглосуточной охраной",
    address: "Пресненская набережная, 2, Москва",
    geoLat: 55.7489,
    geoLng: 37.5414,
    pricePerHour: 15000, // 150 рублей
    covered: true,
    guarded: true,
    camera: true,
    evCharging: true,
    disabledAccessible: true,
    wideEntrance: true,
    accessType: "GARAGE" as const,
    rules: "Доступ через шлагбаум по карте",
    sizeL: 5.0,
    sizeW: 2.2,
    sizeH: 2.5
  },
  {
    title: "Парковка у Парка Горького",
    description: "Открытая парковка рядом с парком, идеально для прогулок",
    address: "Крымский Вал, 9, Москва",
    geoLat: 55.7314,
    geoLng: 37.6014,
    pricePerHour: 10000, // 100 рублей
    covered: false,
    guarded: false,
    camera: true,
    evCharging: false,
    disabledAccessible: true,
    wideEntrance: false,
    accessType: "STREET" as const,
    rules: "Парковка с 6:00 до 23:00",
    sizeL: 4.2,
    sizeW: 1.8,
    sizeH: 2.0
  },
  {
    title: "Парковка у ВДНХ",
    description: "Большая парковка рядом с ВДНХ, много места для крупных автомобилей",
    address: "Проспект Мира, 119, Москва",
    geoLat: 55.8270,
    geoLng: 37.6410,
    pricePerHour: 8000, // 80 рублей
    covered: false,
    guarded: true,
    camera: true,
    evCharging: true,
    disabledAccessible: true,
    wideEntrance: true,
    accessType: "YARD" as const,
    rules: "Парковка для посетителей ВДНХ",
    sizeL: 5.5,
    sizeW: 2.5,
    sizeH: 2.8
  },
  {
    title: "Парковка у Арбата",
    description: "Историческая парковка в самом сердце старой Москвы",
    address: "Арбат, 1, Москва",
    geoLat: 55.7522,
    geoLng: 37.5915,
    pricePerHour: 25000, // 250 рублей
    covered: false,
    guarded: true,
    camera: true,
    evCharging: false,
    disabledAccessible: false,
    wideEntrance: false,
    accessType: "STREET" as const,
    rules: "Только для легковых автомобилей до 2.5м высотой",
    sizeL: 4.0,
    sizeW: 1.8,
    sizeH: 2.0
  },
  {
    title: "Парковка у Сокольников",
    description: "Тихая парковка в зеленом районе, рядом с парком Сокольники",
    address: "Сокольническая площадь, 1, Москва",
    geoLat: 55.7896,
    geoLng: 37.6792,
    pricePerHour: 7000, // 70 рублей
    covered: false,
    guarded: false,
    camera: false,
    evCharging: false,
    disabledAccessible: true,
    wideEntrance: true,
    accessType: "YARD" as const,
    rules: "Бесплатная парковка в выходные",
    sizeL: 4.8,
    sizeW: 2.2,
    sizeH: 2.3
  }
];

async function seedSpots() {
  try {
    console.log('Начинаем добавление тестовых парковочных мест...');

    // Создаем тестового пользователя-владельца
    const testOwner = await prisma.user.upsert({
      where: { email: 'owner@test.com' },
      update: {},
      create: {
        email: 'owner@test.com',
        passwordHash: 'test_hash',
        name: 'Тестовый Владелец',
        phone: '+7 (999) 123-45-67',
        role: 'OWNER'
      }
    });

    console.log('Тестовый владелец создан:', testOwner.email);

    // Добавляем парковочные места
    for (const spotData of moscowSpots) {
      const spot = await prisma.parkingSpot.create({
        data: {
          ...spotData,
          ownerId: testOwner.id,
          status: 'APPROVED',
          instantApproval: true
        }
      });
      console.log(`Добавлено место: ${spot.title} (${spot.address})`);
    }

    console.log('✅ Все тестовые парковочные места успешно добавлены!');
  } catch (error) {
    console.error('❌ Ошибка при добавлении парковочных мест:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedSpots();




