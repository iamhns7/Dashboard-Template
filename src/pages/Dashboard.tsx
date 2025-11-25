import { useTranslation } from 'react-i18next';

const Dashboard = () => {
  const { t } = useTranslation();
  
  return (
    <>
      <h1 className="h3 mb-3">{t('dashboard.welcome')}</h1>
      <p className="lead text-muted">{t('dashboard.description')}</p>
    </>
  );
};

export default Dashboard;