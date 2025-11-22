import styles from './premium.module.css';

/**
 * Premium Component - iJewel3D SDK Integration
 * Sử dụng thuần túy iJewel3D SDK API
 */

const MODELS = [
  { id: "Cs9yFentQsiL9VOyTa8Rdw", name: "Fistion" },
  { id: "bTfEBf0fSHaflMHTd4scxw", name: "Myfav" },
  { id: "MKyTIlEyRbi89oT6bH76yA", name: "Pear" },
];

const Premium = () => {
  const containerRef = useRef(null);
  const [selectedModel, setSelectedModel] = useState(MODELS[0].id);

  useEffect(() => {
    if (!containerRef.current) return;

    // Load model using iJewel3D SDK
    window.ijewelViewer.loadModelById(
      selectedModel,
      'drive',
      containerRef.current,
      {
        showUiButtons: false,
        showLogo: false,
        showCard: false,
        enableZoom: true,
        enableScrollWheel: true,
      }
    );
  }, [selectedModel]);

  return (
    <div className={styles.container}>
      <div ref={containerRef} className={styles.viewerContainer}></div>

      <div className={styles.modelSelectorContainer}>
        <label className={styles.modelLabel}>Model:</label>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className={styles.modelSelector}
        >
          {MODELS.map(model => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Premium;