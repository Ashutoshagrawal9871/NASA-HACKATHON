#include <iostream>
#include <string.h> 
using namespace std;
class cust{
    string Name;
    int balance;
    int cnt=100;
    public:
    cust(string name,int bal) 
    {
        Name=name;
        balance=bal;
        cnt++;
    }
    void print()
    {
        cout<<cnt;
    }
};
// int cust::cnt=0;
int main()
{
    cust x("A",100);
    x.print();
    cust y("B",1000);
    return 0;
}