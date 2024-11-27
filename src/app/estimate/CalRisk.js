export function calRisk(partner1 = false, act = 'insertive_vaginal_sex', PrEP = false, prot = false, ART_UVL = false, acute_hiv_infection_hiv_positive_partner = false, std_infection_hiv_negative_partner = false, std_infection_hiv_positive_partner = false) {
    if (partner1) {
        if (act === 'receptive_anal_sex') {
            act = 'insertive_anal_sex';
        } else if (act === 'receptive_vaginal_sex') {
            act = 'insertive_vaginal_sex';
        }
    }

    const actions = {
        'receptive_anal_sex': 138 / 10000,
        'insertive_anal_sex': 11 / 10000,
        'receptive_vaginal_sex': 8 / 10000,
        'insertive_vaginal_sex': 4 / 10000
    };

    let a = 1;
    if (act === 'receptive_anal_sex') {
        a = 1;
    } else if (act === 'insertive_anal_sex') {
        a = 2;
    } else if (act === 'receptive_vaginal_sex') {
        a = 3;
    } else if (act === 'insertive_vaginal_sex') {
        a = 4;
    }

    const protect = {
        'male_condom_1': 0.28,
        'male_condom_2': 0.37,
        'male_condom_3': 0.2,
        'male_condom_4': 0.2
    };

    let ART_UVL_all = 0;

    let risk_factor_all = 1;
    if (acute_hiv_infection_hiv_positive_partner) {
        risk_factor_all *= 7.25;
    }
    if (std_infection_hiv_negative_partner) {
        risk_factor_all *= 2.65;
    }
    if (std_infection_hiv_positive_partner) {
        risk_factor_all *= 2.65;
    }

    let total_protect = 1;
    if (PrEP) {
        total_protect *= 0.01;
    }
    if (prot) {
        total_protect *= protect[`male_condom_${a}`];
    }
    if (ART_UVL) {
        total_protect *= ART_UVL_all;
    }

    const risk = actions[act] * total_protect * risk_factor_all;
    const roundedRisk = Math.round(risk * 10000);
    return roundedRisk;
}
