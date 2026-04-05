import styles from '../PosterForm.module.css';

interface UploadedImage {
  name: string;
  previewUrl: string;
}

interface PhotoUploaderProps {
  images: UploadedImage[];
  isUploadDragActive: boolean;
  draggingPhotoIndex: number | null;
  errors?: Record<string, string | undefined>;
  onPhotoInput: (e: any) => Promise<void> | void;
  onUploadDragEnter: (e: any) => void;
  onUploadDragOver: (e: any) => void;
  onUploadDragLeave: (e: any) => void;
  onUploadDrop: (e: any) => Promise<void> | void;
  onPhotoDragStart: (index: number) => void;
  onPhotoDragEnd: () => void;
  onPhotoDragOver: (e: any) => void;
  onPhotoDrop: (index: number, e: any) => void;
  removePhoto: (index: number, e: any) => void;
  openPhotoDialog: () => void;
}

export function PhotoUploader(props: PhotoUploaderProps) {
  const {
    images,
    isUploadDragActive,
    draggingPhotoIndex,
    errors,
    onPhotoInput,
    onUploadDragEnter,
    onUploadDragOver,
    onUploadDragLeave,
    onUploadDrop,
    onPhotoDragStart,
    onPhotoDragEnd,
    onPhotoDragOver,
    onPhotoDrop,
    removePhoto,
    openPhotoDialog
  } = props;

  return (
    <div
      className={`${(styles as any).uploadBox} ${isUploadDragActive ? (styles as any).uploadBoxDragActive : ''} ${errors?.images ? (styles as any).choiceGroupError : ''}`}
      onDragEnter={onUploadDragEnter}
      onDragOver={onUploadDragOver}
      onDragLeave={onUploadDragLeave}
      onDrop={onUploadDrop}
    >
      <div className={(styles as any).uploadControls}>
        <input
          id="photoUpload"
          className={(styles as any).fileInput}
          type="file"
          accept="image/jpeg,image/png"
          multiple
          onChange={onPhotoInput}
        />
        <button type="button" className={(styles as any).uploadButton} onClick={openPhotoDialog}>Загрузите фото</button>
        <span className={(styles as any).uploadHint}>или перетащите JPEG, PNG до 10 Мб каждый</span>
      </div>

      {images.length > 0 && (
        <div className={(styles as any).photoThumbGrid}>
          {images.map((image, index) => (
            <div
              key={`photo-${index.toString()}`}
              className={`${(styles as any).photoThumb} ${draggingPhotoIndex === index ? (styles as any).photoThumbDragging : ''}`}
              draggable
              onDragStart={() => onPhotoDragStart(index)}
              onDragEnd={onPhotoDragEnd}
              onDragOver={onPhotoDragOver}
              onDrop={(e: any) => onPhotoDrop(index, e)}
            >
              {index === 0 && <span className={(styles as any).mainPhotoBadge}>Главное фото</span>}
              <div className={(styles as any).photoOverlay}>
                <span className={(styles as any).photoOverlayText}>Удерживайте, чтобы перетащить</span>
                <button
                  type="button"
                  className={(styles as any).photoRemoveButton}
                  onClick={(e: any) => removePhoto(index, e)}
                  aria-label="Удалить фото"
                >
                  x
                </button>
              </div>
              <img src={image.previewUrl} alt={image.name} draggable="false" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PhotoUploader;
