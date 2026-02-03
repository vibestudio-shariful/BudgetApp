
import streamlit as st
import sqlite3
import pandas as pd
import plotly.express as px
from datetime import datetime
import os

# --- কনফিগারেশন এবং স্টাইলিং ---
st.set_page_config(page_title="Personal Finance Manager", layout="wide", page_icon="💰")

def local_css():
    st.markdown("""
        <style>
        .main { background-color: #f8fafc; }
        .stMetric { background-color: white; padding: 20px; border-radius: 15px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
        .stButton>button { border-radius: 10px; width: 100%; font-weight: bold; }
        .stTextInput>div>div>input, .stSelectbox>div>div>select { border-radius: 10px; }
        div[data-testid="stExpander"] { border-radius: 15px; border: 1px solid #e2e8f0; background: white; }
        </style>
    """, unsafe_allow_list=True)

# --- লোকালইজেশন ডিকশনারি ---
translations = {
    'en': {
        'title': 'Finance Manager Pro',
        'lang_label': 'Language / ভাষা',
        'dashboard': 'Dashboard',
        'history': 'History',
        'debts': 'Debt Tracker',
        'about': 'Developer Info',
        'income': 'Total Income',
        'expense': 'Total Expense',
        'balance': 'Balance',
        'debt_total': 'Net Debt',
        'add_trans': 'Add Transaction',
        'type': 'Type',
        'cat': 'Category',
        'amt': 'Amount',
        'date': 'Date',
        'note': 'Note',
        'save': 'Save Data',
        'income_label': 'Income',
        'expense_label': 'Expense',
        'lend': 'Lend (ধার দেওয়া)',
        'borrow': 'Borrow (ধার নেওয়া)',
        'person': 'Person Name',
        'status': 'Status',
        'pending': 'Pending',
        'settled': 'Settled',
        'delete': 'Delete',
        'search': 'Search transactions...',
        'no_data': 'No data recorded yet.',
        'dev_name': 'Md. Shariful Islam',
        'dev_desc': 'Expert Software Developer dedicated to creating secure finance solutions.'
    },
    'bn': {
        'title': 'ব্যক্তিগত অর্থ ব্যবস্থাপক',
        'lang_label': 'ভাষা / Language',
        'dashboard': 'ড্যাশবোর্ড',
        'history': 'ইতিহাস',
        'debts': 'ঋণ ট্র্যাকার',
        'about': 'ডেভেলপার তথ্য',
        'income': 'মোট আয়',
        'expense': 'মোট ব্যয়',
        'balance': 'বর্তমান ব্যালেন্স',
        'debt_total': 'মোট ঋণ',
        'add_trans': 'লেনদেন যোগ করুন',
        'type': 'ধরণ',
        'cat': 'বিভাগ',
        'amt': 'পরিমাণ',
        'date': 'তারিখ',
        'note': 'নোট',
        'save': 'সংরক্ষণ করুন',
        'income_label': 'আয়',
        'expense_label': 'ব্যয়',
        'lend': 'ধার দেওয়া',
        'borrow': 'ধার নেওয়া',
        'person': 'ব্যক্তির নাম',
        'status': 'অবস্থা',
        'pending': 'বকেয়া',
        'settled': 'পরিশোধিত',
        'delete': 'মুছে ফেলুন',
        'search': 'লেনদেন খুঁজুন...',
        'no_data': 'এখনো কোনো তথ্য নেই।',
        'dev_name': 'মো. শরিফুল ইসলাম',
        'dev_desc': 'সফটওয়্যার ডেভেলপার, নিরাপদ ফিন্যান্স অ্যাপ তৈরিতে নিবেদিত।'
    }
}

# --- ডাটাবেস ফাংশন ---
def get_db_connection():
    conn = sqlite3.connect('finance_db.sqlite', check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS transactions 
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, type TEXT, category TEXT, amount REAL, date TEXT, note TEXT)''')
    c.execute('''CREATE TABLE IF NOT EXISTS debts 
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, type TEXT, person TEXT, amount REAL, date TEXT, note TEXT, status TEXT)''')
    conn.commit()

# --- মেইন অ্যাপ্লিকেশন লজিক ---
def main():
    local_css()
    init_db()
    conn = get_db_connection()

    # ভাষা নির্বাচন
    if 'lang' not in st.session_state:
        st.session_state.lang = 'bn'

    st.sidebar.markdown(f"### ⚙️ {translations[st.session_state.lang]['lang_label']}")
    lang_toggle = st.sidebar.selectbox("", ["বাংলা", "English"], index=0 if st.session_state.lang == 'bn' else 1)
    st.session_state.lang = 'bn' if lang_toggle == "বাংলা" else 'en'
    
    t = translations[st.session_state.lang]

    st.sidebar.title(f"💰 {t['title']}")
    menu = [t['dashboard'], t['history'], t['debts'], t['about']]
    choice = st.sidebar.radio("", menu)

    # --- ড্যাশবোর্ড ---
    if choice == t['dashboard']:
        st.header(f"📊 {t['dashboard']}")
        
        df = pd.read_sql_query("SELECT * FROM transactions", conn)
        debt_df = pd.read_sql_query("SELECT * FROM debts WHERE status='PENDING'", conn)
        
        income = df[df['type'] == 'INCOME']['amount'].sum()
        expense = df[df['type'] == 'EXPENSE']['amount'].sum()
        lend = debt_df[debt_df['type'] == 'LEND']['amount'].sum()
        borrow = debt_df[debt_df['type'] == 'BORROW']['amount'].sum()
        
        m1, m2, m3, m4 = st.columns(4)
        m1.metric(t['income'], f"৳{income:,.2f}")
        m2.metric(t['expense'], f"৳{expense:,.2f}")
        m3.metric(t['balance'], f"৳{(income - expense):,.2f}")
        m4.metric(t['debt_total'], f"৳{(borrow - lend):,.2f}")

        st.divider()

        c1, c2 = st.columns([1, 1])
        with c1:
            st.subheader(f"🖋️ {t['add_trans']}")
            with st.form("new_trans", clear_on_submit=True):
                ttype = st.selectbox(t['type'], [t['expense_label'], t['income_label']])
                db_type = 'INCOME' if ttype == t['income_label'] else 'EXPENSE'
                cat = st.text_input(t['cat'], placeholder="e.g. Food, Salary")
                amt = st.number_input(t['amt'], min_value=0.0, step=10.0)
                dt = st.date_input(t['date'], datetime.now())
                nt = st.text_input(t['note'])
                if st.form_submit_button(t['save']):
                    if amt > 0 and cat:
                        conn.cursor().execute("INSERT INTO transactions (type, category, amount, date, note) VALUES (?,?,?,?,?)",
                                            (db_type, cat, amt, str(dt), nt))
                        conn.commit()
                        st.success("Success!")
                        st.rerun()

        with c2:
            if not df.empty:
                st.subheader("Monthly Analysis")
                fig = px.pie(values=[income, expense], names=[t['income_label'], t['expense_label']], 
                            color_discrete_sequence=['#10b981', '#f43f5e'], hole=0.4)
                st.plotly_chart(fig, use_container_width=True)
            else:
                st.info(t['no_data'])

    # --- ইতিহাস ---
    elif choice == t['history']:
        st.header(f"📜 {t['history']}")
        q = st.text_input(t['search'])
        df = pd.read_sql_query("SELECT id, type, category, amount, date, note FROM transactions ORDER BY date DESC", conn)
        
        if q:
            df = df[df['category'].str.contains(q, case=False) | df['note'].str.contains(q, case=False)]
        
        if not df.empty:
            st.dataframe(df, use_container_width=True, hide_index=True)
            
            # ডিলিট অপশন
            del_id = st.number_input("Enter ID to Delete", min_value=0, step=1)
            if st.button(t['delete'], type="secondary"):
                conn.cursor().execute("DELETE FROM transactions WHERE id=?", (del_id,))
                conn.commit()
                st.rerun()
        else:
            st.info(t['no_data'])

    # --- ঋণ ট্র্যাকার ---
    elif choice == t['debts']:
        st.header(f"🤝 {t['debts']}")
        
        with st.expander(f"➕ {t['add_trans']}"):
            with st.form("debt_form", clear_on_submit=True):
                dtype = st.selectbox(t['type'], [t['lend'], t['borrow']])
                db_dtype = 'LEND' if dtype == t['lend'] else 'BORROW'
                person = st.text_input(t['person'])
                amt = st.number_input(t['amt'], min_value=0.0)
                dt = st.date_input(t['date'], datetime.now())
                if st.form_submit_button(t['save']):
                    conn.cursor().execute("INSERT INTO debts (type, person, amount, date, status) VALUES (?,?,?,?,?)",
                                        (db_dtype, person, amt, str(dt), 'PENDING'))
                    conn.commit()
                    st.rerun()

        df_debts = pd.read_sql_query("SELECT * FROM debts", conn)
        if not df_debts.empty:
            for _, row in df_debts.iterrows():
                with st.container():
                    col1, col2, col3 = st.columns([3, 1, 1])
                    status_color = "🔴" if row['status'] == 'PENDING' else "🟢"
                    type_icon = "⬆️" if row['type'] == 'LEND' else "⬇️"
                    
                    col1.markdown(f"**{type_icon} {row['person']}** - ৳{row['amount']:,}  \n*{row['date']}*")
                    col2.markdown(f"{status_color} {t[row['status'].lower()]}")
                    
                    if row['status'] == 'PENDING':
                        if col3.button(f"Settle", key=f"s_{row['id']}"):
                            conn.cursor().execute("UPDATE debts SET status='SETTLED' WHERE id=?", (row['id'],))
                            conn.commit()
                            st.rerun()
                    else:
                        if col3.button(f"Del", key=f"d_{row['id']}"):
                            conn.cursor().execute("DELETE FROM debts WHERE id=?", (row['id'],))
                            conn.commit()
                            st.rerun()
                st.divider()
        else:
            st.info(t['no_data'])

    # --- ডেভেলপার তথ্য ---
    elif choice == t['about']:
        st.header(f"👤 {t['about']}")
        st.success(f"### {t['dev_name']}")
        st.write(t['dev_desc'])
        st.markdown("""
        - 📧 **Email:** Connect.shariful@gmail.com
        - 💻 **Tech:** Python, Streamlit, SQLite, Plotly
        - 🛡️ **Privacy:** All data is stored locally on your device.
        """)

if __name__ == "__main__":
    main()
