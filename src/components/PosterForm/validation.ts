import type { CreatePosterFormData, CreatePosterStep } from '../../types/posterCreate';

export type CreatePosterField = keyof CreatePosterFormData;

export interface StepValidationResult {
  isValid: boolean;
  errors: Partial<Record<CreatePosterField, string>>;
}

function required(value: string, message: string) {
  return value.trim() ? null : message;
}

function numberInRange(value: string, min: number, max: number, message: string) {
  const numberValue = Number(value);
  if (!value.trim()) return null;
  if (!Number.isFinite(numberValue) || numberValue < min || numberValue > max) return message;
  return null;
}

function positiveNumber(value: string, message: string) {
  const numberValue = Number(value);
  if (!value.trim()) return null;
  if (!Number.isFinite(numberValue) || numberValue <= 0) return message;
  return null;
}

export function validateStep(step: CreatePosterStep, data: CreatePosterFormData): StepValidationResult {
  const errors: Partial<Record<CreatePosterField, string>> = {};

  if (step === 1) {
    const categoryError = required(data.housingType, 'Выберите тип жилья');
    if (categoryError) errors.housingType = categoryError;

    const addressError = required(data.address, 'Укажите адрес');
    if (addressError) errors.address = addressError;
    if (!addressError && data.address.trim().length < 5) {
      errors.address = 'Слишком короткий адрес';
    }
  }

  if (step === 2) {
    const floorRequiredError = required(data.floor, 'Укажите этаж');
    if (floorRequiredError) errors.floor = floorRequiredError;

    const floorError = numberInRange(data.floor, 1, 500, 'Этаж должен быть от 1 до 500');
    if (floorError) errors.floor = floorError;

    const floorsRequiredError = required(data.floorCount, 'Укажите этажность дома');
    if (floorsRequiredError) errors.floorCount = floorsRequiredError;

    const flatNumberRequiredError = required(data.flatNumber, 'Укажите номер квартиры');
    if (flatNumberRequiredError) errors.flatNumber = flatNumberRequiredError;

    const floorsError = numberInRange(data.floorCount, 1, 500, 'Этажность должна быть от 1 до 500');
    if (floorsError) errors.floorCount = floorsError;

    if (!floorRequiredError && !floorsRequiredError && !floorError && !floorsError && Number(data.floor) > Number(data.floorCount)) {
      errors.floor = 'Этаж не может быть выше этажности дома';
    }

    if (data.flatNumber.trim()) {
      const flatNumberError = numberInRange(data.flatNumber, 1, 99999, 'Номер квартиры должен быть от 1 до 99999');
      if (flatNumberError) errors.flatNumber = flatNumberError;
    }

    if (data.complexName && data.complexName.trim() && data.complexName.trim().length < 2) {
      errors.complexName = 'Название ЖК слишком короткое';
    }
  }

  if (step === 3) {
    const allowedRooms = ['0','1', '2', '3', '4', '5', '6+'];
    const roomsError = required(data.roomCount, 'Укажите количество комнат');
    if (roomsError) errors.roomCount = roomsError;
    if (!roomsError && !allowedRooms.includes(data.roomCount)) {
      errors.roomCount = 'Выберите корректное количество комнат';
    }
    console.log(data.roomCount)

    const areaRequiredError = required(data.area, 'Укажите площадь');
    if (areaRequiredError) errors.area = areaRequiredError;

    const areaError = numberInRange(data.area, 1, 100000, 'Площадь должна быть от 1 до 100000 м2');
    if (areaError) errors.area = areaError;
  }

  if (step === 4) {
    if (data.images.length === 0) {
      errors.images = 'Добавьте минимум одно фото';
    }
    if (data.images.length > 12) {
      errors.images = 'Можно загрузить не более 12 фото';
    }
  }

  if (step === 5) {
    const descriptionError = required(data.description, 'Добавьте описание объявления');
    if (descriptionError) errors.description = descriptionError;
    if (!descriptionError && data.description.trim().length < 20) {
      errors.description = 'Описание должно быть не короче 20 символов';
    }
    if (!descriptionError && data.description.trim().length > 3000) {
      errors.description = 'Описание должно быть короче 3000 символов';
    }

    const priceRequiredError = required(data.price, 'Укажите цену');
    if (priceRequiredError) errors.price = priceRequiredError;

    const priceError = positiveNumber(data.price, 'Цена должна быть положительным числом');
    if (priceError) errors.price = priceError;

    if (Number(data.price) > 10000000){
      errors.price = "Слишком большая цена";
    }
  

    const previousStepErrors = [1, 2, 3, 4]
      .map((s) => validateStep(s as CreatePosterStep, data).errors)
      .reduce((acc, curr) => ({ ...acc, ...curr }), {} as Partial<Record<CreatePosterField, string>>);

    const allErrors = { ...previousStepErrors, ...errors };

    return {
      isValid: Object.keys(allErrors).length === 0,
      errors: allErrors
    };
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

