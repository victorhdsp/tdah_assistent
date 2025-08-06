import { dateFormat } from "./dateFormat";

export function parseDynamicDate(dateString: string): Date | null {
    const [month, day, year] = dateFormat(new Date()).split('/').map(Number);
    const now = new Date(year, month - 1, day - 1);
    let resultDate = now;

    switch ((dateString || '').toLowerCase()) {
        case 'hoje': break;
        case 'ontem': resultDate.setDate(now.getDate() - 1); break;
        case 'segunda-feira': resultDate.setDate(now.getDate() - now.getDay() - 6); break;
        case 'terça-feira': resultDate.setDate(now.getDate() - now.getDay() - 5); break;
        case 'quarta-feira': resultDate.setDate(now.getDate() - now.getDay() - 4); break;
        case 'quinta-feira': resultDate.setDate(now.getDate() - now.getDay() - 3); break;
        case 'sexta-feira': resultDate.setDate(now.getDate() - now.getDay() - 2); break;
        case 'sábado': resultDate.setDate(now.getDate() - now.getDay() - 1); break;
        case 'domingo': resultDate.setDate(now.getDate() - now.getDay()); break;
        default: break;
    }
    
    return resultDate;
}
