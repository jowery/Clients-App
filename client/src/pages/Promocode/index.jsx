import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { BsArrowClockwise } from 'react-icons/bs';
import { AiOutlineDelete } from 'react-icons/ai';
import { IoIosArrowRoundDown, IoIosArrowRoundUp } from 'react-icons/io';
import { IoSync } from 'react-icons/io5';
import {
  getPromocode,
  editPromocode,
  removePromocodes,
} from '../../redux/slices/promocodesSlice';
import {
  getTariffs,
  setSelectedItems,
  addSelectedItem,
  removeSelectedItem,
} from '../../redux/slices/tariffsSlice';
import { setSortBy, setSortType } from '../../redux/slices/filterSlice';
import { PROMOCODES_ROUTE } from '../../utils/consts';
import Menu from '../../components/Menu';
import Header from '../../components/Header';
import InformationBlock from '../../components/InformationBlock';
import Button from '../../components/Button';
import Table from '../../components/Table';
import TableRow from '../../components/TableRow';
import styles from './Promocode.module.scss';
import headerStyles from '../../components/Header/Header.module.scss';

const Promocode = () => {
  const { id } = useParams();
  const [data, setData] = useState([]);
  const [clickedHeader, setClickedHeader] = useState();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const promocodesStatus = useSelector((state) => state.promocodes.status);
  const tariffsStatus = useSelector((state) => state.tariffs.status);
  const sortBy = useSelector((state) => state.filter.sortBy);
  const sortType = useSelector((state) => state.filter.sortType);
  const values = ['id', 'name', 'amount'];
  const headers = ['id', 'Название', 'Сумма'];

  const promocode = useSelector((state) => state.promocodes.promocode);

  const tariffs = useSelector((state) => state.tariffs.items);
  const selectedItems = useSelector((state) => state.tariffs.selectedItems);

  useEffect(() => {
    const fetchPromocode = async () => {
      await dispatch(getPromocode({ id }));
      await dispatch(getTariffs({ usePagination: false, sortBy, sortType }));
    };

    fetchPromocode();
  }, [sortBy, sortType]);

  useEffect(() => {
    const selectData = async () => {
      if (promocodesStatus === 'succeeded') {
        setData([
          {
            propName: 'id',
            name: 'id',
            value: promocode.id,
            disabled: true,
            type: 'text',
          },
          {
            propName: 'code',
            name: 'Код',
            value: promocode.code,
            disabled: false,
            type: 'text',
          },
          {
            propName: 'discount',
            name: 'Скидка',
            value: promocode.discount,
            disabled: false,
            type: 'email',
          },
          {
            propName: 'date_start',
            name: 'Дата начала',
            value: promocode.date_start,
            disabled: true,
            type: 'text',
          },
          {
            propName: 'date_end',
            name: 'Дата окончания',
            value: promocode.date_end,
            disabled: true,
            type: 'text',
          },
        ]);
      }

      if (tariffsStatus === 'succeeded') {
        await dispatch(setSelectedItems(promocode.tariffs));
      }
    };

    selectData();
  }, [promocodesStatus, tariffsStatus]);

  const deletePromocodes = async (promocodes) => {
    await dispatch(removePromocodes(promocodes));
  };

  const edit = (editingIndex) => {
    dispatch(
      editPromocode({
        id,
        data: {
          [data[editingIndex].propName]: data[editingIndex].value,
        },
      })
    );
  };

  const handleCheckboxClick = () => {
    if (selectedItems.length !== tariffs.length) {
      dispatch(setSelectedItems(tariffs));
    } else {
      dispatch(setSelectedItems([]));
    }
  };

  return (
    <>
      <Menu />
      <div className={styles.wrapper}>
        <Header>
          <div className={headerStyles.buttons}>
            <Button
              onClick={async (event) => {
                await dispatch(
                  editPromocode({
                    id,
                    data: {
                      tariffs: selectedItems,
                    },
                  })
                );
              }}
            >
              <IoSync
                size={30}
                className={styles.icon}
                color="rgba(171,171,171, 0.75)"
              />
              <span>Сохранить</span>
            </Button>
            <Button
              onClick={(event) => {
                event.preventDefault();
                deletePromocodes({ promocodes: promocode });
                navigate(PROMOCODES_ROUTE);
              }}
            >
              <AiOutlineDelete
                size={30}
                className={styles.icon}
                color="rgba(171,171,171, 0.75)"
              />
              <span>Удалить</span>
            </Button>
          </div>
        </Header>
        <div className={styles.content}>
          {promocodesStatus === 'succeeded' && tariffsStatus === 'succeeded' ? (
            <>
              <InformationBlock
                data={data}
                setData={setData}
                promocode={promocode}
                edit={edit}
              />
              <div className={styles.additionalInfo}>
                <>
                  {tariffs.length ? (
                    <Table
                      name={'Тарифы'}
                      headers={headers}
                      values={values}
                      clickedHeader={clickedHeader}
                      onHeaderClick={(item) => {
                        dispatch(setSortBy(item));
                        setClickedHeader(item);
                        if (sortType === 'DESC' || !sortType) {
                          dispatch(setSortType('ASC'));
                        }
                        if (sortType === 'ASC') {
                          dispatch(setSortType('DESC'));
                        } else if (sortType) {
                          dispatch(setSortType(''));
                        }
                      }}
                      icon={
                        sortType === 'ASC' ? (
                          <IoIosArrowRoundUp />
                        ) : sortType === 'DESC' ? (
                          <IoIosArrowRoundDown />
                        ) : (
                          ''
                        )
                      }
                      checked={selectedItems?.length === tariffs?.length}
                      onSelect={handleCheckboxClick}
                    >
                      {tariffs.map((item) => (
                        <TableRow
                          key={item.id}
                          values={values}
                          showCheckbox={true}
                          /* checked={promocode.tariffs?.some((element) => {
                            if (element.id === item.id) {
                              return true;
                            }
                            return false;
                          })} */
                          checked={selectedItems?.some((element) => {
                            if (element.id === item.id) {
                              return true;
                            }
                            return false;
                          })}
                          onSelect={async () => {
                            dispatch(addSelectedItem(item));
                          }}
                          onUnselect={async () => {
                            dispatch(removeSelectedItem(item));
                          }}
                        >
                          {item}
                        </TableRow>
                      ))}
                    </Table>
                  ) : (
                    <span>Нет тарифов ☹️</span>
                  )}
                </>
              </div>
            </>
          ) : (
            <>
              <div className={styles.informationBlockLoading}>
                <BsArrowClockwise className={styles.loadingIcon} size={75} />
              </div>
              <div className={styles.additionalInfo}>
                <div className={styles.tariffBlockLoading}>
                  <BsArrowClockwise className={styles.loadingIcon} size={75} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Promocode;
