var default_data = {
    coinstar: {
        tp: {
            legal_name: 'Coinstar E-payment Services Inc',
            virginia_id: '35680594383F001',
            FEIN: '680594383',
            compliance_code: 3520,
            physical_address: {
                street: 'PO Box 91258',
                city: 'Bellevue',
                state: 'WA',
                zip: '98008-9528',
            },
            mailing_address: {
                street: 'PO Box 91258',
                city: 'Bellevue',
                state: 'WA',
                zip: '98008-9528',
            },
            mailing_sameas_physical: true,
            initial_contact: {
                name: 'John Brezinski',
                phone: '425-943-8336',
                phone_ext: null,
                fax: '425-637-0253',
                fax_ext: null,
                email: 'johnbrezinski@coinstar.com'
            },
            representative: {
                name: 'John Brezinski',
                phone: '425-943-8336',
                phone_ext: null,
                fax: '425-637-0253',
                fax_ext: null,
                email: 'johnbrezinski@coinstar.com'
            },
        },

        primary_auditor: {
            name: 'Thomas Benton',
            title: 'Interstate Auditor',
            address: 'P O Box 2509',
            city_st_zip: 'Dallas, GA 301 32-9998',
            district: 'Interstate Audit Unit',
            phone: '770-445-0867',
            phone_ext: '12',
            fax: '770-445-8069',
            fex_ext: '34',
            email: 'Thomas.Benton@tax.Virginia.gov',
            user_id: 5907
        },

        details: {
            filing_status: 'C',
            date_begin: '06/28/2011',
            workpaper_id: 'MF-9C8',
            status: 'Open',
        },

        supervisor: {
            name: 'Joanne Bialek',
            title: 'Interstate Auditor Senior',
            address: '123 Topfield Rd.',
            city_st_zip: 'Ipswich, MA 01938',
            email: 'Joanne.Bialek@tax.Virginia.gov',
            phone: '978-356-3003',
            phone_ext: '12',
            fax: '978-356-2003',
            fex_ext: '34',
        },

        audit_period: {
            '2007': {
                year_type: 'A',
                begin_date: null,
                end_date: null,
                return_filed: true,
                extension_filed: true,
                extended_thru: '10/15/2008',
                final_return: false,
                multistate_corp: true,
                noprofit_corp: false,

            },
            '2008': {},
        }
    }
};

var dataOpts = {
    filingStatus: {
        A: 'Consoldated',
        B: 'Combined',
        C: 'Separate Form 500',
        D: 'Other'
    },
    year_type: {
        A: 'Calendar Year',
        B: 'Fiscal Year'

    },
};
