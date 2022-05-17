interface CreditCard {
  card_number: string;
  ccv: string;
  owner: string;
  expires: string;
}

export function mapToCreditCard(json: any): CreditCard {
  return {
    card_number: json.card_number,
    ccv: json.ccv,
    owner: json.owner,
    expires: json.expires,
  } as CreditCard;
}

export function isCreditCard(json: any): json is CreditCard {
  return (
    "card_number" in json &&
    typeof json.card_number === "string" &&
    "ccv" in json &&
    typeof json.ccv === "string" &&
    "owner" in json &&
    typeof json.owner === "string" &&
    "expires" in json &&
    typeof json.expires === "string"
  );
}

export function validCreditCardNumber(value: string): boolean {
  //Accept only digits, dashes or spaces
  if (/[^0-9-\s]+/.test(value)) return false;

  //The Luhn Algorithm
  let nCheck: number = 0,
    nDigit: number = 0,
    bEven: boolean = false;
  value = value.replace(/\D/g, "");

  for (let n = value.length - 1; n >= 0; n--) {
    const cDigit = value.charAt(n);
    nDigit = parseInt(cDigit, 10);

    if (bEven) {
      if ((nDigit *= 2) > 9) nDigit -= 9;
    }

    nCheck += nDigit;
    bEven = !bEven;
  }

  return nCheck % 10 == 0;
}

export default CreditCard;
