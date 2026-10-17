import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getLexradarConfig } from "@/lib/lexradar-config";
import LexradarForm from "@/components/lexradar-form";
import { ConsentSettingsButton } from "@/components/consent/consent-settings-button";
import "./lexradar.css";

// Read the verified form switch at runtime, without caching SMTP readiness.
export const dynamic = "force-dynamic";

const title = "LexRadar — юридический аудит сайта | GØL Web Studio";
const description =
  "Бесплатная предварительная проверка публичной части сайта: персональные данные, согласия и обязательные документы. Индивидуальные документы и инструкции вебмастеру.";
export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "https://www.golwebstudio.ru/lexradar" },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["https://www.golwebstudio.ru/lexradar/og.png"],
  },
  openGraph: {
    title,
    description,
    url: "https://www.golwebstudio.ru/lexradar",
    type: "website",
    locale: "ru_RU",
    siteName: "GØL Web Studio",
    images: [
      {
        url: "https://www.golwebstudio.ru/lexradar/og.png",
        width: 1200,
        height: 630,
        alt: "LexRadar — юридический аудит сайтов",
      },
    ],
  },
};
const risks = [
  [
    "01",
    "Незаконная обработка персональных данных",
    "Сбор данных должен иметь правовое основание и соответствовать заявленной цели. Даже привычная форма заявки требует внимания.",
    "ч. 1 ст. 13.11 КоАП РФ",
  ],
  [
    "02",
    "Нарушение требований к письменному согласию",
    "Речь о случаях, когда письменное согласие обязательно по закону. Обычный чекбокс не заменяет его во всех ситуациях.",
    "ч. 2 ст. 13.11 КоАП РФ",
  ],
  [
    "03",
    "Отсутствие доступной политики обработки персональных данных",
    "Посетитель должен иметь возможность ознакомиться с политикой. Важны доступность документа и соответствие реальным процессам.",
    "ч. 3 ст. 13.11 КоАП РФ",
  ],
  [
    "04",
    "Нарушение обязанности уведомить Роскомнадзор",
    "Необходимость уведомления зависит от обработки данных и предусмотренных законом исключений. Наличие сайта само по себе не определяет обязанность.",
    "ч. 10 ст. 13.11 КоАП РФ",
  ],
  [
    "05",
    "Неуведомление об установленном инциденте с персональными данными",
    "Общее предупреждение: при установленном инциденте могут возникнуть обязанности по уведомлению. Внешний аудит сайта не устанавливает факт инцидента или неуведомления.",
    "ч. 11 ст. 13.11 КоАП РФ",
  ],
];
const checks = [
  "Политика обработки персональных данных",
  "Формы заявок и обратной связи",
  "Согласия пользователей",
  "Обязательные сведения на сайте",
  "Публичные признаки взаимодействия со сторонними сервисами",
  "Отраслевые требования",
];
const deliverables = [
  "Краткий перечень обнаруженных проблем",
  "Объяснение возможных последствий",
  "Предварительная оценка рисков",
  "Ссылки на применимые нормы законодательства",
  "Рекомендации по дальнейшим действиям",
];
const documents = [
  "Индивидуальные юридические документы",
  "Необходимые тексты для сайта",
  "Формы согласий при наличии правовых оснований",
  "Подробное техническое задание вебмастеру",
  "Методические рекомендации",
  "Контрольный список внедрения",
];

export default function LexradarPage() {
  const config = getLexradarConfig();
  const enabled = config.enabled && config.ready;
  return (
    <div className="lexradar">
      <a href="#main-content" className="lr-skip">
        Перейти к содержимому
      </a>
      <header className="lr-header">
        <nav className="lr-wrap lr-nav" aria-label="Навигация LexRadar">
          <Link href="/" className="lr-logo" aria-label="GØL — на главную">
            G<span>Ø</span>L
          </Link>
          <a href="#risks">Юридические риски</a>
          <a href="#check" className="lr-nav-cta">
            Проверить сайт{" "}
            <ArrowUpRight
              aria-hidden="true"
              size={16}
              className="inline-block shrink-0"
            />
          </a>
        </nav>
      </header>
      <main id="main-content" tabIndex={-1}>
        <section className="lr-wrap lr-hero" aria-labelledby="hero-title">
          <div>
            <p className="lr-label">LEXRADAR — ЮРИДИЧЕСКИЙ АУДИТ САЙТОВ</p>
            <h1 id="hero-title">
              Ваш сайт может работать идеально.
              <br />
              <span>И всё равно привести к штрафу.</span>
            </h1>
            <p className="lr-intro">
              Ошибки в обработке персональных данных, согласиях пользователей и
              обязательных документах могут обойтись бизнесу дорого.
            </p>
            <p className="lr-muted">
              Проверьте документы до запуска рекламы и сбора новых заявок.
            </p>
            <div className="lr-actions">
              <a className="lr-button" href="#check">
                Бесплатно проверить сайт{" "}
                <ArrowUpRight
                  aria-hidden="true"
                  size={16}
                  className="inline-block shrink-0"
                />
              </a>
              <a className="lr-secondary" href="#risks">
                Узнать о юридических рисках ↓
              </a>
            </div>
          </div>
          <aside
            className="lr-signal"
            aria-label="Фокус предварительной проверки"
          >
            <div className="lr-orbit" aria-hidden="true">
              <i />
              <b />
              <span>LR</span>
            </div>
            <p className="lr-label">РАБОТАЕТ ≠ СООТВЕТСТВУЕТ</p>
            <h2>
              Технически исправен.
              <br />
              <span>Юридически уязвим?</span>
            </h2>
            <p>Формы · Согласия · Документы</p>
            <div className="lr-signal-note">
              Проверяем публичную часть сайта.
              <br />
              Объясняем риски и следующие шаги.
            </div>
          </aside>
        </section>
        <section className="lr-section lr-wrap" id="risks">
          <p className="lr-label">01 / ЦЕНА НЕВНИМАНИЯ</p>
          <h2>Пять проблем, которые могут дорого обойтись вашему бизнесу</h2>
          <div className="lr-risk-grid">
            {risks.map(([number, heading, text, law]) => (
              <article key={number} className="lr-risk">
                <div className="lr-risk-top">
                  <span>{number}</span>
                  <span>ЮРИДИЧЕСКИЙ РИСК</span>
                </div>
                <h3>{heading}</h3>
                <p>{text}</p>
                <p className="lr-law">{law}</p>
              </article>
            ))}
          </div>
          <p className="lr-note">
            Ответственность зависит от конкретных обстоятельств. Предварительный
            анализ сайта не является установлением факта административного
            правонарушения.
          </p>
          <p className="lr-note">
            Применимость составов и действующая редакция норм требуют проверки
            на дату оценки. Размеры санкций здесь не приводятся до подтверждения
            актуальности.
          </p>
        </section>
        <section className="lr-section lr-wrap lr-split" id="scope">
          <div>
            <p className="lr-label">02 / ПРЕДМЕТ ПРОВЕРКИ</p>
            <h2>
              Мы ищем юридические риски, которые могут оставаться незамеченными
              годами
            </h2>
            <p className="lr-muted">
              Проверяется публично доступная часть сайта. Внутренние процессы
              обработки данных и отдельные обстоятельства требуют
              дополнительного изучения.
            </p>
          </div>
          <ol className="lr-checks">
            {checks.map((item, index) => (
              <li key={item}>
                <span>0{index + 1}</span>
                {item}
              </li>
            ))}
          </ol>
        </section>
        <section className="lr-section lr-wrap">
          <div className="lr-panel lr-split">
            <div>
              <p className="lr-label">03 / БЕСПЛАТНЫЙ ПЕРВЫЙ ШАГ</p>
              <h2>Узнайте, какие проблемы обнаружены на вашем сайте</h2>
              <p className="lr-muted">
                LexRadar помогает провести предварительную диагностику публичной
                части сайта и выявить признаки возможных юридических нарушений.
              </p>
              <a className="lr-secondary" href="#check">
                Начать с предварительной проверки{" "}
                <ArrowUpRight
                  aria-hidden="true"
                  size={16}
                  className="inline-block shrink-0"
                />
              </a>
            </div>
            <div>
              <h3>Что вы получите</h3>
              <ul className="lr-list">
                {deliverables.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="lr-note">
                Это предварительная диагностика, а не полноценное юридическое
                заключение. Заявку рассматривают после отправки; мгновенная
                автоматическая проверка не предусмотрена.
              </p>
            </div>
          </div>
        </section>
        <section className="lr-section lr-wrap lr-split" id="solution">
          <div>
            <p className="lr-label">04 / ОТ РИСКОВ К ДЕЙСТВИЯМ</p>
            <h2>
              Нашли проблемы? Подготовим документы и инструкции для вашего
              вебмастера.
            </h2>
            <p className="lr-muted">
              Мы разработаем индивидуальные юридические документы с учётом
              особенностей вашей организации и сайта.
            </p>
            <p className="lr-muted">
              Ваш вебмастер получит подробное техническое задание и сможет
              самостоятельно внести необходимые изменения.
            </p>
            <p className="lr-note">
              Платная услуга. Состав, стоимость и сроки согласовываются
              индивидуально. Коммерческий исполнитель — ИП Голубев.
            </p>
          </div>
          <div className="lr-document">
            <p className="lr-label">ВАШ ПАКЕТ ВНЕДРЕНИЯ</p>
            <h3>
              Документы.
              <br />
              Тексты.
              <br />
              <span>Понятный план.</span>
            </h3>
            <ul className="lr-list">
              {documents.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>
        <section className="lr-section lr-wrap" id="partners">
          <div className="lr-partners">
            <p className="lr-label">05 / ДЛЯ ПАРТНЁРОВ</p>
            <h2>
              Помогите своим клиентам избежать ненужных юридических рисков
            </h2>
            <p className="lr-muted">
              Если вы занимаетесь бухгалтерским сопровождением, разработкой
              сайтов или консультированием бизнеса, предложите клиентам
              бесплатную предварительную проверку LexRadar.
            </p>
            <p className="lr-muted">
              Это простой способ обратить внимание на проблемы, которые могут
              потребовать профессионального юридического решения.
            </p>
            <a href="#check" className="lr-secondary">
              Предложить клиенту проверку{" "}
              <ArrowUpRight
                aria-hidden="true"
                size={16}
                className="inline-block shrink-0"
              />
            </a>
          </div>
        </section>
        <section className="lr-section lr-wrap lr-split" id="check">
          <div>
            <p className="lr-label">06 / НАЧНИТЕ С ПРОВЕРКИ</p>
            <h2>Проверьте свой сайт бесплатно</h2>
            <p className="lr-muted">
              Оставьте адрес сайта и контактный email. Мы рассмотрим заявку и
              свяжемся с вами для предварительной диагностики.
            </p>
            <div className="lr-steps">
              <p>
                <span>01</span> Вы оставляете заявку
              </p>
              <p>
                <span>02</span> Мы изучаем публичную часть сайта
              </p>
              <p>
                <span>03</span> Вы получаете ориентиры для дальнейших действий
              </p>
            </div>
            <p className="lr-note">
              Без обязательства заказывать платные услуги.
            </p>
          </div>
          <div className="lr-panel">
            <LexradarForm enabled={enabled} />
          </div>
        </section>
      </main>
      <footer className="lr-wrap lr-footer">
        <Link href="/" className="lr-logo">
          G<span>Ø</span>L
        </Link>
        <p>LexRadar · ИП Голубев</p>
        <ConsentSettingsButton />
        <Link href="/privacy">Политика обработки данных</Link>
        <a href="mailto:golwebstudio@mail.ru">golwebstudio@mail.ru</a>
      </footer>
    </div>
  );
}
