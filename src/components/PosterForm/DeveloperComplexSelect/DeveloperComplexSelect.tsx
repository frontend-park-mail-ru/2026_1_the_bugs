
import styles from '../PosterForm.module.css';
import { getDevelopers, getComplexesByDeveloper } from '../../../services/complex';
import { useEffect, useState } from 'the-react/hooks';

interface DeveloperComplexSelectProps {
  selectedDeveloperId: number | null;
  selectedComplexIdOrAlias?: string;
  onSelectDeveloper: (id: number | null, developerName?: string) => void;
  onSelectComplex: (complexId: string) => void;
  errors?: Record<string, string | undefined>;
}

export function DeveloperComplexSelect({ selectedDeveloperId, selectedComplexIdOrAlias, onSelectDeveloper, onSelectComplex, errors }: DeveloperComplexSelectProps) {
  const [developers, setDevelopers] = useState<{ developer_id: number; developer_name: string }[]>([]);
  const [isLoadingDevelopers, setIsLoadingDevelopers] = useState(false);
  const [developersError, setDevelopersError] = useState<string | null>(null);
  const [complexes, setComplexes] = useState<{ id: number; company_name: string }[]>([]);
  const [isLoadingComplexes, setIsLoadingComplexes] = useState(false);
  const [complexesError, setComplexesError] = useState<string | null>(null);
  const [isDeveloperMenuOpen, setIsDeveloperMenuOpen] = useState(false);
  const [isComplexMenuOpen, setIsComplexMenuOpen] = useState(false);

  useEffect(() => {
    setIsLoadingDevelopers(true);
    getDevelopers()
      .then((data: any) => {
        setDevelopers(data.developers || []);
        setDevelopersError(null);
      })
      .catch(() => setDevelopersError('Ошибка загрузки списка ЖК'))
      .finally(() => setIsLoadingDevelopers(false));
  }, []);

  useEffect(() => {
    if (selectedDeveloperId == null) {
      setComplexes([]);
      setComplexesError(null);
      return;
    }
    setIsLoadingComplexes(true);
    getComplexesByDeveloper(selectedDeveloperId)
      .then((data: any) => {
        setComplexes(data.utility_companies || []);
        setComplexesError(null);
      })
      .catch(() => setComplexesError('Ошибка загрузки списка ЖК'))
      .finally(() => setIsLoadingComplexes(false));
  }, [selectedDeveloperId]);

  const selectedDeveloperName = selectedDeveloperId == null
    ? ''
    : developers.find((d) => d.developer_id === selectedDeveloperId)?.developer_name || '';
  const selectedComplexName = selectedComplexIdOrAlias ? (complexes.find((c) => Number(c.id) === Number(selectedComplexIdOrAlias))?.company_name || '') : '';

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest('[data-custom-select="developer"]')) {
        setIsDeveloperMenuOpen(false);
      }
      if (!target?.closest('[data-custom-select="complex"]')) {
        setIsComplexMenuOpen(false);
      }
    };
    document.addEventListener('click', onDocumentClick);
    return () => document.removeEventListener('click', onDocumentClick);
  }, []);

  return (
    <div style={{'display': 'grid', 'gap': 'inherit','grid-template-columns':'1fr 1fr'}}>
      <div className={`${styles.group} ${styles.stepSelectGroup}`}>
        <label className={styles.label} htmlFor="complexName">Застройщик</label>
        <div className={styles.customSelect} data-custom-select="developer">
          <button
            id="complexName"
            type="button"
            className={`${styles.customSelectButton} ${errors?.complexName ? styles.selectError : ''} ${isDeveloperMenuOpen ? styles.customSelectButtonOpen : ''}`}
            disabled={isLoadingDevelopers}
            onClick={() => setIsDeveloperMenuOpen(!isDeveloperMenuOpen)}
          >
            <span
              className={`${styles.customSelectValue} ${selectedDeveloperName ? '' : styles.customSelectPlaceholder}`}
              title={selectedDeveloperName || 'Выберите застройщика'}
            >
              {selectedDeveloperName || 'Выберите застройщика'}
            </span>
            <span className={styles.stepSelectArrow} aria-hidden="true">▾</span>
          </button>
          {isDeveloperMenuOpen && (
            <div className={styles.customSelectMenu}>
              <button
                type="button"
                className={`${styles.customSelectOption} ${!selectedDeveloperName ? styles.customSelectOptionActive : ''}`}
                onClick={() => onSelectDeveloper(null)}
              >
                Выберите застройщика
              </button>
              {developers.map((developer) => (
                <button
                  key={`developer-${developer.developer_id}`}
                  type="button"
                  className={`${styles.customSelectOption} ${selectedDeveloperId === developer.developer_id ? styles.customSelectOptionActive : ''}`}
                  onClick={() => onSelectDeveloper(developer.developer_id, developer.developer_name)}
                >
                  {developer.developer_name}
                </button>
              ))}
              {!isLoadingDevelopers && developers.length === 0 && (
                <div className={styles.customSelectOption}>Список застройщиков пока пуст</div>
              )}
            </div>
          )}
        </div>
        {isLoadingDevelopers && <span className={styles.selectHint}>Загружаем список застройщиков...</span>}
        {!isLoadingDevelopers && developers.length === 0 && !developersError && (
          <span className={styles.selectHint}>Список застройщиков пока пуст</span>
        )}
        {developersError && <span className={styles.error}>{developersError}</span>}
        {errors?.complexName && <span className={styles.error}>{errors.complexName}</span>}
      </div>

      <div className={`${styles.group} ${styles.stepSelectGroup}`}>
        <label className={styles.label} htmlFor="complex">ЖК</label>
        <div className={styles.customSelect} data-custom-select="complex">
          <button
            id="complex"
            type="button"
            className={`${styles.customSelectButton} ${errors?.complex ? styles.selectError : ''} ${isComplexMenuOpen ? styles.customSelectButtonOpen : ''}`}
            disabled={isLoadingComplexes || selectedDeveloperId == null}
            onClick={() => setIsComplexMenuOpen(!isComplexMenuOpen)}
          >
            <span
              className={`${styles.customSelectValue} ${selectedComplexName ? '' : styles.customSelectPlaceholder}`}
              title={selectedComplexName || (selectedDeveloperId == null ? 'Сначала выберите застройщика' : 'Выберите ЖК')}
            >
              {selectedComplexName || (selectedDeveloperId == null ? 'Сначала выберите застройщика' : 'Выберите ЖК')}
            </span>
            <span className={styles.stepSelectArrow} aria-hidden="true">▾</span>
          </button>
          {isComplexMenuOpen && (
            <div className={styles.customSelectMenu}>
              {complexes.map((complex) => (
                <button
                  key={`complex-${complex.id}`}
                  type="button"
                  className={`${styles.customSelectOption} ${String(selectedComplexIdOrAlias) === String(complex.id) ? styles.customSelectOptionActive : ''}`}
                  onClick={() => onSelectComplex(String(complex.id))}
                >
                  {complex.company_name}
                </button>
              ))}
              {!isLoadingComplexes && selectedDeveloperId != null && complexes.length === 0 && (
                <div className={styles.customSelectOption}>Для этого застройщика пока нет ЖК</div>
              )}
            </div>
          )}
        </div>
        {isLoadingComplexes && <span className={styles.selectHint}>Загружаем список ЖК...</span>}
        {!isLoadingComplexes && selectedDeveloperId != null && complexes.length === 0 && !complexesError && (
          <span className={styles.selectHint}>Для этого застройщика пока нет ЖК</span>
        )}
        {complexesError && <span className={styles.error}>{complexesError}</span>}
        {errors?.complex && <span className={styles.error}>{errors.complex}</span>}
      </div>
    </div>
  );
}

export default DeveloperComplexSelect;
