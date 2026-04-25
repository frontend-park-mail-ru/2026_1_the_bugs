import { useNavigate } from '@router-dom';
import styles from './AdminReportPage.module.css';

interface AdminReportPageProps {
  id?: string;
}

interface Report {
  id: string;
  date: string;
  title: string;
  requestMessage: string;
}

const reports: Report[] = [
  {
    id: '8643352',
    date: '21 апреля в 23:12',
    title: 'Личный кабинет и аккаунт',
    requestMessage:
      'Не удается изменить номер телефона в профиле. После сохранения появляется ошибка и старые данные возвращаются.',
  },
  {
    id: '1288472',
    date: '12 марта в 14:27',
    title: 'Технические сбои',
    requestMessage:
      'На странице с объявлениями периодически не подгружаются карточки, а фильтр сбрасывается после обновления.',
  },
  {
    id: '9541208',
    date: '03 марта в 10:03',
    title: 'Сброс пароля',
    requestMessage:
      'Письмо со ссылкой для сброса пароля не приходит более 30 минут. Проверены папки "Спам" и "Промоакции".',
  },
];

const findReportById = (id?: string) => reports.find((report) => report.id === id);

export function AdminReportPage({ id }: AdminReportPageProps) {
  const navigate = useNavigate();
  const report = findReportById(id);

  if (!report) {
    return (
      <section className={styles.page}>
        <div className={styles.wrapper}>
          <h1 className={styles.notFoundTitle}>Обращение не найдено</h1>
          <button type="button" className={styles.backButton} onClick={() => navigate('/admin/reports')}>
            Назад к списку
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <article className={styles.wrapper}>
        <div className={styles.metaRow}>
          <p className={styles.number}>№{report.id}</p>
          <p className={styles.date}>{report.date}</p>
        </div>

        <h1 className={styles.title}>{report.title}</h1>

        <p className={styles.blockTitle}>Сообщение заявителя</p>
        <div className={styles.messageBox}>{report.requestMessage}</div>

        <p className={styles.blockTitle}>Ответное сообщение</p>
        <textarea
          className={styles.replyBox}
          placeholder="Введите ответ заявителю"
          rows={4}
        />

        <div className={styles.actions}>
          <button type="button" className={styles.backButton} onClick={() => navigate('/admin/reports')}>
            Назад
          </button>
          <button type="button" className={styles.sendButton}>Отправить</button>
        </div>
      </article>
    </section>
  );
}

