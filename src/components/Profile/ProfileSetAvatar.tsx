import { useEffect, useState } from 'the-react/hooks';
import style from './ProfileSetAvatar.module.css';

interface ProfileSetAvatarProps {
	isOpen: boolean;
	file: File | null;
	onClose: () => void;
	onApply: (file: File, previewUrl: string) => void;
}

interface ImageSize {
	width: number;
	height: number;
}

const CROP_SIZE = 280;
const OUTPUT_SIZE = 600;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.01;


const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const getRenderScale = (imageSize: ImageSize, zoom: number) => {
	if (!imageSize.width || !imageSize.height) {
		return 1;
	}

	return Math.max(CROP_SIZE / imageSize.width, CROP_SIZE / imageSize.height) * zoom;
};

const clampOffsets = (offsetX: number, offsetY: number, imageSize: ImageSize, zoom: number) => {
	const renderScale = getRenderScale(imageSize, zoom);
	const renderWidth = imageSize.width * renderScale;
	const renderHeight = imageSize.height * renderScale;
	const maxOffsetX = Math.max(0, (renderWidth - CROP_SIZE) / 2);
	const maxOffsetY = Math.max(0, (renderHeight - CROP_SIZE) / 2);

	return {
		offsetX: clamp(offsetX, -maxOffsetX, maxOffsetX),
		offsetY: clamp(offsetY, -maxOffsetY, maxOffsetY),
	};
};

const loadImageFromUrl = (url: string) => new Promise<HTMLImageElement>((resolve, reject) => {
	const image = new Image();
	image.onload = () => resolve(image);
	image.onerror = () => reject(new Error('Не удалось загрузить изображение'));
	image.src = url;
});

const toAvatarFileName = (fileName: string) => {
	const baseName = fileName.replace(/\.[^.]+$/, '') || 'avatar';
	return `${baseName}-avatar.jpg`;
};

async function cropAvatarFile(file: File, imageSize: ImageSize, zoom: number, offsetX: number, offsetY: number) {
	const sourceUrl = URL.createObjectURL(file);

	try {
		const image = await loadImageFromUrl(sourceUrl);
		const renderScale = getRenderScale(imageSize, zoom);
		const renderWidth = imageSize.width * renderScale;
		const renderHeight = imageSize.height * renderScale;
		const imageLeft = CROP_SIZE / 2 - renderWidth / 2 + offsetX;
		const imageTop = CROP_SIZE / 2 - renderHeight / 2 + offsetY;
		const sourceX = Math.max(0, (0 - imageLeft) / renderScale);
		const sourceY = Math.max(0, (0 - imageTop) / renderScale);
		const sourceSize = CROP_SIZE / renderScale;

		const canvas = document.createElement('canvas');
		canvas.width = OUTPUT_SIZE;
		canvas.height = OUTPUT_SIZE;

		const context = canvas.getContext('2d');
		if (!context) {
			throw new Error('Не удалось подготовить изображение');
		}

		context.drawImage(
			image,
			sourceX,
			sourceY,
			sourceSize,
			sourceSize,
			0,
			0,
			OUTPUT_SIZE,
			OUTPUT_SIZE,
		);

		const blob = await new Promise<Blob>((resolve, reject) => {
			canvas.toBlob((result) => {
				if (!result) {
					reject(new Error('Не удалось сформировать файл аватара'));
					return;
				}

				resolve(result);
			}, 'image/jpeg', 0.92);
		});

		return new File([blob], toAvatarFileName(file.name), { type: 'image/jpeg' });
	} finally {
		URL.revokeObjectURL(sourceUrl);
	}
}

export function ProfileSetAvatar({ isOpen, file, onClose, onApply }: ProfileSetAvatarProps) {
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [imageSize, setImageSize] = useState<ImageSize>({ width: 0, height: 0 });
	const [zoom, setZoom] = useState(MIN_ZOOM);
	const [offsetX, setOffsetX] = useState(0);
	const [offsetY, setOffsetY] = useState(0);
	const [isDragging, setIsDragging] = useState(false);
	const [dragStartX, setDragStartX] = useState(0);
	const [dragStartY, setDragStartY] = useState(0);
	const [startOffsetX, setStartOffsetX] = useState(0);
	const [startOffsetY, setStartOffsetY] = useState(0);
	const [isApplying, setIsApplying] = useState(false);
	const [localError, setLocalError] = useState<string | null>(null);

	useEffect(() => {
		if (!isOpen || !file) {
			setPreviewUrl(null);
			setImageSize({ width: 0, height: 0 });
			setZoom(MIN_ZOOM);
			setOffsetX(0);
			setOffsetY(0);
			setIsDragging(false);
			setLocalError(null);
			return;
		}

		const nextUrl = URL.createObjectURL(file);
		setPreviewUrl(nextUrl);
		setImageSize({ width: 0, height: 0 });
		setZoom(MIN_ZOOM);
		setOffsetX(0);
		setOffsetY(0);
		setLocalError(null);

		return () => {
			URL.revokeObjectURL(nextUrl);
		};
	}, [isOpen, file]);

	useEffect(() => {
		if (!isDragging) {
			return;
		}

		const handleMouseMove = (event: MouseEvent) => {
			const nextOffsetX = startOffsetX + (event.clientX - dragStartX);
			const nextOffsetY = startOffsetY + (event.clientY - dragStartY);
			const nextOffsets = clampOffsets(nextOffsetX, nextOffsetY, imageSize, zoom);
			setOffsetX(nextOffsets.offsetX);
			setOffsetY(nextOffsets.offsetY);
		};

		const stopDragging = () => {
			setIsDragging(false);
		};

		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', stopDragging);

		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', stopDragging);
		};
	}, [isDragging, dragStartX, dragStartY, imageSize, startOffsetX, startOffsetY, zoom]);

	const handleImageLoad = (event: any) => {
		const target = event.target as HTMLImageElement;
		setImageSize({
			width: target.naturalWidth || CROP_SIZE,
			height: target.naturalHeight || CROP_SIZE,
		});
	};

	const handleDragStart = (event: any) => {
		if (!imageSize.width || !imageSize.height) {
			return;
		}

		event.preventDefault();
		setIsDragging(true);
		setDragStartX(event.clientX);
		setDragStartY(event.clientY);
		setStartOffsetX(offsetX);
		setStartOffsetY(offsetY);
	};

	const handleZoomInput = (event: any) => {
		const nextZoom = clamp(Number(event.target.value), MIN_ZOOM, MAX_ZOOM);
		const nextOffsets = clampOffsets(offsetX, offsetY, imageSize, nextZoom);
		setZoom(nextZoom);
		setOffsetX(nextOffsets.offsetX);
		setOffsetY(nextOffsets.offsetY);
	};

	const handleApply = async () => {
		if (!file || !previewUrl) {
			return;
		}

		setIsApplying(true);
		setLocalError(null);

		try {
			const croppedFile = await cropAvatarFile(file, imageSize, zoom, offsetX, offsetY);
			const nextPreviewUrl = URL.createObjectURL(croppedFile);
			onApply(croppedFile, nextPreviewUrl);
		} catch (error) {
			console.error(error);
			setLocalError('Не удалось подготовить аватар. Попробуйте другое изображение.');
		} finally {
			setIsApplying(false);
		}
	};

	const renderScale = getRenderScale(imageSize, zoom);
	const imageWidth = imageSize.width ? imageSize.width * renderScale : CROP_SIZE;
	const imageHeight = imageSize.height ? imageSize.height * renderScale : CROP_SIZE;
	const imageLeft = CROP_SIZE / 2 - imageWidth / 2 + offsetX;
	const imageTop = CROP_SIZE / 2 - imageHeight / 2 + offsetY;
	const zoomPercent = `${Math.round(zoom * 100)}%`;
	const modalClassName = `modal ${isOpen ? 'active' : ''}`;
	const cropAreaClassName = `${style.cropArea} ${isDragging ? style.cropAreaDragging : ''}`;
	const displayPreviewUrl = previewUrl;

	const handleOverlayClick = (event: any) => {
		if ((event.target as HTMLElement).classList.contains('modal')) {
			onClose();
		}
	};

	return (
		<div className={modalClassName} onClick={handleOverlayClick}>
			<div className="modal-content">
				<button className="close-button" onClick={onClose}></button>
				<div className={style.root}>
					<h2 className={style.title}>Выберите область аватара</h2>
					<p className={style.hint}>Перетащите изображение внутри круга и подберите масштаб.</p>

					<div
						className={cropAreaClassName}
						onMouseDown={handleDragStart}
					>
						<img
							className={style.image}
							src={displayPreviewUrl}
							alt="Предпросмотр аватара"
							draggable="false"
							onLoad={handleImageLoad}
							style={{
								width: `${imageWidth}px`,
								height: `${imageHeight}px`,
								left: `${imageLeft}px`,
								top: `${imageTop}px`,
							}}
						/>
						<div className={style.overlay} />
						<div className={style.circleFrame} />
						<div className={style.crosshairX} />
						<div className={style.crosshairY} />
					</div>

					<div className={style.controls}>
						<div className={style.controlHead}>
							<span>Масштаб</span>
							<span className={style.value}>{zoomPercent}</span>
						</div>
						<input
							className={style.zoomInput}
							type="range"
							min={MIN_ZOOM}
							max={MAX_ZOOM}
							step={ZOOM_STEP}
							value={zoom}
							onInput={handleZoomInput}
						/>
					</div>

					<div className={style.error}>{localError || ''}</div>

					<div className={style.actions}>
						<button type="button" className={style.secondary} onClick={onClose} disabled={isApplying}>
							Отмена
						</button>
						<button type="button" className={style.primary} onClick={handleApply} disabled={isApplying || !file}>
							{isApplying ? 'Обработка...' : 'Применить'}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}